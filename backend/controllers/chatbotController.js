import Borrower from '../models/Borrower.js';
import Message from '../models/Message.js';
import EMIRecommendation from '../models/EMIRecommendation.js';
import aiChatService from '../services/aiChatService.js';
import twilioService from '../services/twilioService.js';
import { syncRiskLevelWithStress } from '../utils/riskSync.js';

// @desc    Start automated outreach for overdue borrowers
// @route   POST /api/chatbot/start
// @access  Private (Manager only)
export const startAutomatedOutreach = async (req, res, next) => {
    try {
        const { minOverdueDays = 7, limit = 50 } = req.body;

        // Find ALL overdue borrowers in the system who haven't accepted a plan yet
        const overdueBorrowers = await Borrower.find({
            isOverdue: true,
            overdueDays: { $gte: minOverdueDays },
            emiPlanStatus: { $ne: 'accepted' }
        })
            .sort({ overdueDays: -1 })
            .limit(limit);

        if (overdueBorrowers.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No overdue borrowers found',
                data: {
                    messagesCreated: 0,
                    borrowersContacted: []
                }
            });
        }

        const results = [];

        // Generate and send initial messages
        for (const borrower of overdueBorrowers) {
            // REMOVED COOL-DOWN CHECK for "Launch Automated Sequence" to ensure immediate feedback

            // Generate initial message
            const messageText = aiChatService.generateInitialMessage(borrower);

            // Add delay to prevent Twilio Trial rate limits
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Send real SMS
            let smsResult = { success: false };
            if (borrower.phoneNumber) {
                console.log(`[BOT] Attempting SMS to ${borrower.customerName} (${borrower.phoneNumber})...`);
                smsResult = await twilioService.sendSMS(borrower.phoneNumber, messageText);
            } else {
                smsResult = { success: false, error: 'No phone number' };
            }

            if (smsResult.success) {
                // Only create message in DB if SMS was successful
                const message = await Message.create({
                    borrowerId: borrower._id,
                    managerId: req.user._id,
                    sender: 'manager',
                    text: messageText,
                    isRead: false,
                    isAutomated: true,
                    conversationState: 'initiated'
                });

                results.push({
                    borrowerId: borrower._id,
                    borrowerName: borrower.customerName,
                    overdueDays: borrower.overdueDays,
                    messageSent: true,
                    messageId: message._id
                });
            } else {
                console.error(`❌ Failed to send automated message to ${borrower.customerName}: ${smsResult.error || 'Unknown error'}`);
                results.push({
                    borrowerId: borrower._id,
                    borrowerName: borrower.customerName,
                    overdueDays: borrower.overdueDays,
                    messageSent: false,
                    error: smsResult.error || 'SMS failed'
                });
            }
        }

        const successCount = results.filter(r => r.messageSent).length;
        const failCount = results.length - successCount;

        res.status(200).json({
            success: true,
            message: `Automated outreach processed for ${results.length} borrowers. Success: ${successCount}, Failed: ${failCount}`,
            data: {
                messagesCreated: successCount,
                borrowersContacted: results
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process borrower reply and suggest EMI plans
// @route   POST /api/chatbot/process-reply/:borrowerId
// @access  Private (Manager only)
export const processBorrowerReply = async (req, res, next) => {
    try {
        const { borrowerId } = req.params;
        const { replyText } = req.body;

        if (!replyText || !replyText.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Reply text is required'
            });
        }

        // Get borrower details
        const borrower = await Borrower.findById(borrowerId);
        if (!borrower) {
            return res.status(404).json({
                success: false,
                error: 'Borrower not found'
            });
        }

        // Analyze the response using comprehensive behavioral scoring
        const behavioralScoring = (await import('../services/behavioralScoring.js')).default;
        const comprehensiveAnalysis = await behavioralScoring.calculateComprehensiveScore({
            message: replyText,
            borrower: borrower,
            responseTime: 0
        });

        // Store comprehensive behavioral analysis in borrower model
        borrower.behavioralAnalysis = {
            stressLevel: comprehensiveAnalysis.stressLevel,
            primaryIssue: comprehensiveAnalysis.primaryIssue,
            willingnessToPay: comprehensiveAnalysis.willingnessToPay,
            lastAnalysisDate: new Date(),
            detailedInsights: `Comprehensive chatbot analysis (Score: ${comprehensiveAnalysis.compositeScore}/100): ${comprehensiveAnalysis.primaryIssue} detected. Stress level: ${comprehensiveAnalysis.stressLevel}.`
        };

        // Sync riskLevel with stressLevel for consistency
        borrower.riskLevel = await syncRiskLevelWithStress(comprehensiveAnalysis.stressLevel, borrower);

        // Update risk level based on analysis (fallback)
        const { analyzeRiskLevel } = await import('../services/aiService.js');
        const sentimentData = {
            sentiment: comprehensiveAnalysis.stressLevel,
            score: comprehensiveAnalysis.compositeScore
        };
        const newRiskLevel = await analyzeRiskLevel(replyText, sentimentData);
        if (newRiskLevel !== 'PENDING' && comprehensiveAnalysis.compositeScore > 70) {
            borrower.riskLevel = newRiskLevel;
        }

        // Generate EMI plans based on stress level
        const { planA, planB } = aiChatService.generateEMIPlans(borrower, comprehensiveAnalysis.stressLevel);

        // Generate response with plans
        const responseText = aiChatService.generateResponseWithPlans(
            borrower,
            comprehensiveAnalysis,
            planA,
            planB
        );

        // Create AI response message
        const aiMessage = await Message.create({
            borrowerId: borrower._id,
            managerId: req.user._id,
            sender: 'manager',
            text: responseText,
            isRead: false,
            isAutomated: true,
            conversationState: 'plan_suggested',
            metadata: {
                analysis: comprehensiveAnalysis,
                plansOffered: { planA, planB }
            }
        });

        // Send real SMS
        if (borrower.phoneNumber) {
            await twilioService.sendSMS(borrower.phoneNumber, responseText);
        }

        // Create EMI recommendations in database
        const recommendations = [];

        // Create Plan A
        const recA = await EMIRecommendation.create({
            borrowerId: borrower._id,
            managerId: req.user._id,
            riskLevel: borrower.riskLevel,
            suggestedEMI: planA.suggestedEMI,
            extendedTenure: planA.extendedTenure,
            gracePeriod: planA.gracePeriod,
            interestWaiver: planA.interestWaiver,
            status: 'Pending',
            planType: 'A',
            isAutomated: true
        });
        recommendations.push(recA);

        // Create Plan B
        const recB = await EMIRecommendation.create({
            borrowerId: borrower._id,
            managerId: req.user._id,
            riskLevel: borrower.riskLevel,
            suggestedEMI: planB.suggestedEMI,
            extendedTenure: planB.extendedTenure,
            gracePeriod: planB.gracePeriod,
            interestWaiver: planB.interestWaiver,
            status: 'Pending',
            planType: 'B',
            isAutomated: true
        });
        recommendations.push(recB);

        // Update borrower EMI plan status
        borrower.emiPlanStatus = 'pending';
        await borrower.save();

        res.status(200).json({
            success: true,
            data: {
                analysis,
                message: aiMessage,
                plans: {
                    planA: recA,
                    planB: recB
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active chatbot conversations
// @route   GET /api/chatbot/conversations
// @access  Private (Manager only)
export const getChatbotConversations = async (req, res, next) => {
    try {
        // Match all automated messages regardless of manager
        const matchStage = { isAutomated: true };

        const conversations = await Message.aggregate([
            {
                // Find all borrowers who have participated in an automated flow
                $match: {
                    $or: [
                        { isAutomated: true },
                        { sender: 'borrower' } // Include borrower replies to these flows
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$borrowerId',
                    lastMessage: { $first: '$$ROOT' },
                    messageCount: { $sum: 1 }
                }
            },
            {
                // Filter to ensure we only show borrowers who actually have had an automated outreach
                $lookup: {
                    from: 'messages',
                    let: { bId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$borrowerId', '$$bId'] }, { $eq: ['$isAutomated', true] }] } } },
                        { $limit: 1 }
                    ],
                    as: 'hasAutomated'
                }
            },
            {
                $match: { 'hasAutomated.0': { $exists: true } }
            },
            {
                $lookup: {
                    from: 'borrowers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'borrower'
                }
            },
            {
                $unwind: '$borrower'
            },
            {
                $project: {
                    borrowerId: '$_id',
                    borrowerName: '$borrower.customerName',
                    loanId: '$borrower.loanId',
                    overdueDays: '$borrower.overdueDays',
                    lastMessageText: '$lastMessage.text',
                    lastMessageTime: '$lastMessage.createdAt',
                    conversationState: '$lastMessage.conversationState',
                    messageCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get specific conversation
// @route   GET /api/chatbot/conversation/:borrowerId
// @access  Private (Manager only)
export const getConversation = async (req, res, next) => {
    try {
        const { borrowerId } = req.params;

        const messages = await Message.find({
            borrowerId,
            managerId: req.user._id
        })
            .sort({ createdAt: 1 });

        const borrower = await Borrower.findById(borrowerId);

        res.status(200).json({
            success: true,
            data: {
                borrower,
                messages
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete automated conversation for a borrower
// @route   DELETE /api/chatbot/conversation/:borrowerId
// @access  Private (Manager only)
export const deleteConversation = async (req, res, next) => {
    try {
        const { borrowerId } = req.params;

        // Delete only automated messages for this borrower
        const result = await Message.deleteMany({
            borrowerId,
            isAutomated: true
        });

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} automated messages for borrower ${borrowerId}`,
            data: {
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        next(error);
    }
};
