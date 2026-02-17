import EMIRecommendation from '../models/EMIRecommendation.js';
import Borrower from '../models/Borrower.js';
import { generateEMISuggestion } from '../services/aiService.js';

// @desc    Get EMI suggestion for a borrower
// @route   GET /api/borrowers/:id/suggest-emi
// @access  Private (Manager only)
export const getEMISuggestion = async (req, res, next) => {
    try {
        const borrower = await Borrower.findById(req.params.id);
        if (!borrower) {
            return res.status(404).json({ success: false, error: 'Borrower not found' });
        }

        // Get the latest message sentiment from this borrower
        // In a real app we'd query the latest message, for now we assume risk based on overdue days or last sentiment
        const suggestion = generateEMISuggestion(borrower.loanAmount, borrower.riskLevel === 'RISKY' ? 'High' : 'Moderate');

        res.status(200).json({
            success: true,
            data: suggestion
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create and send EMI recommendation
// @route   POST /api/borrowers/:id/recommend-emi
// @access  Private (Manager only)
export const createRecommendation = async (req, res, next) => {
    try {
        const { suggestedEMI, extendedTenure, gracePeriod, riskLevel } = req.body;

        const recommendation = await EMIRecommendation.create({
            borrowerId: req.params.id,
            managerId: req.user._id,
            riskLevel,
            suggestedEMI,
            extendedTenure,
            gracePeriod,
            status: 'Pending'
        });

        // Update borrower status
        await Borrower.findByIdAndUpdate(req.params.id, { emiPlanStatus: 'pending' });

        res.status(201).json({
            success: true,
            data: recommendation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update recommendation status (Accept/Reject)
// @route   PUT /api/borrowers/recommendations/:id
// @access  Private (Borrower only)
export const updateRecommendationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const recommendation = await EMIRecommendation.findById(req.params.id);
        if (!recommendation) {
            return res.status(404).json({ success: false, error: 'Recommendation not found' });
        }

        recommendation.status = status;
        await recommendation.save();

        // Update borrower record
        await Borrower.findByIdAndUpdate(recommendation.borrowerId, {
            emiPlanStatus: status.toLowerCase()
        });

        // Create a chat message to make the acceptance/rejection visible in the conversation
        const Message = (await import('../models/Message.js')).default;
        const managerId = recommendation.managerId;

        await Message.create({
            borrowerId: recommendation.borrowerId,
            managerId: managerId,
            sender: 'manager',
            text: status === 'Accepted'
                ? `✅ PLAN ACCEPTED: I have officially confirmed your restructured payment plan.\n\n• New EMI: ₹${recommendation.suggestedEMI.toLocaleString()}\n• Extended Tenure: ${recommendation.extendedTenure} Months\n• Grace Period: ${recommendation.gracePeriod} Days\n\nPlease ensure payments are made on time according to these new terms. Your file has been updated.`
                : `❌ PLAN REJECTED: You have declined the proposed restructuring. Our tactical team will review your account to provide an alternative solution, or we may proceed with standard recovery protocols.`,
            isRead: false,
            isAutomated: true,
            conversationState: status === 'Accepted' ? 'plan_accepted' : 'plan_rejected',
            metadata: {
                recommendationId: recommendation._id,
                action: status,
                planDetails: {
                    emi: recommendation.suggestedEMI,
                    tenure: recommendation.extendedTenure,
                    gracePeriod: recommendation.gracePeriod
                }
            }
        });

        // Send SMS confirmation for accepted plans
        if (status === 'Accepted') {
            const borrower = await Borrower.findById(recommendation.borrowerId);
            if (borrower && borrower.phoneNumber) {
                const twilioService = (await import('../services/twilioService.js')).default;
                await twilioService.sendSMS(borrower.phoneNumber, `✅ PLAN ACCEPTED: Your restructured plan is confirmed. New EMI: ₹${recommendation.suggestedEMI.toLocaleString()}, Tenure: ${recommendation.extendedTenure} Months, Grace: ${recommendation.gracePeriod} Days. Check your dashboard for details.`);
            }
        }

        // Trigger automatic "Plan B" if rejected
        if (status === 'Rejected') {
            const borrower = await Borrower.findById(recommendation.borrowerId);
            if (borrower) {
                const { generateLenientEMISuggestion } = await import('../services/aiService.js');
                const newSuggestion = generateLenientEMISuggestion(borrower.loanAmount);

                const managerId = recommendation.managerId || borrower.assignedManager || borrower.uploadedBy;

                await EMIRecommendation.create({
                    borrowerId: borrower._id,
                    managerId,
                    riskLevel: 'High (Auto-Revised)',
                    suggestedEMI: newSuggestion.suggestedEMI,
                    extendedTenure: newSuggestion.extendedTenure,
                    gracePeriod: newSuggestion.gracePeriod,
                    status: 'Pending'
                });

                // Set borrower back to pending for the new plan
                borrower.emiPlanStatus = 'pending';
                await borrower.save();
            }
        }

        res.status(200).json({
            success: true,
            data: recommendation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get latest recommendation for a borrower
// @route   GET /api/borrowers/:id/latest-recommendation
// @access  Private
export const getLatestRecommendation = async (req, res, next) => {
    try {
        // First try to find the ACTIVE (Pending) recommendation
        // This handles cases where we restore an older plan (Plan A)
        let recommendation = await EMIRecommendation.findOne({
            borrowerId: req.params.id,
            status: 'Pending'
        });

        // If no pending plan, get the most recent one (could be Accepted/Rejected/Superseded)
        if (!recommendation) {
            recommendation = await EMIRecommendation.findOne({ borrowerId: req.params.id })
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            data: recommendation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Restore previous Plan A from Plan B
// @route   POST /api/borrowers/:id/restore-plan-a
// @access  Private (Borrower only)
export const restorePlanA = async (req, res, next) => {
    try {
        const borrowerId = req.params.id;

        // 1. Find the current latest recommendation (Plan B)
        const currentRec = await EMIRecommendation.findOne({ borrowerId })
            .sort({ createdAt: -1 });

        if (!currentRec || !currentRec.riskLevel.includes('Auto-Revised')) {
            return res.status(400).json({
                success: false,
                error: 'No active Plan B found to restore from'
            });
        }

        // 2. Mark Plan B as Superseded
        currentRec.status = 'Superseded';
        await currentRec.save();

        // 3. Find the absolute FIRST recommendation (Plan A)
        const previousRec = await EMIRecommendation.findOne({
            borrowerId,
            _id: { $ne: currentRec._id },
            riskLevel: { $not: /Auto-Revised/ }
        }).sort({ createdAt: 1 });

        if (!previousRec) {
            return res.status(404).json({
                success: false,
                error: 'Previous plan (Plan A) not found'
            });
        }

        // 4. Set Plan A back to Pending
        previousRec.status = 'Pending';
        await previousRec.save();

        // 5. Update borrower status
        await Borrower.findByIdAndUpdate(borrowerId, { emiPlanStatus: 'pending' });

        res.status(200).json({
            success: true,
            message: 'Plan A restored successfully',
            data: previousRec
        });
    } catch (error) {
        next(error);
    }
};
