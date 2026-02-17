import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import EMIRecommendation from './models/EMIRecommendation.js';
import { generateLenientEMISuggestion } from './services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find all borrowers in 'rejected' status
        const borrowers = await Borrower.find({ emiPlanStatus: 'rejected' });
        console.log(`Found ${borrowers.length} borrowers with rejected status.`);

        for (const b of borrowers) {
            // Find the latest rejected recommendation
            const latestRec = await EMIRecommendation.findOne({
                borrowerId: b._id,
                status: 'Rejected'
            }).sort({ createdAt: -1 });

            if (latestRec) {
                // Check if a Pending one already exists after it
                const pendingRec = await EMIRecommendation.findOne({
                    borrowerId: b._id,
                    status: 'Pending',
                    createdAt: { $gt: latestRec.createdAt }
                });

                if (!pendingRec) {
                    console.log(`Creating Plan B for ${b.customerName}...`);
                    const newSuggestion = generateLenientEMISuggestion(b.loanAmount);
                    const managerId = latestRec.managerId || b.assignedManager || b.uploadedBy;

                    if (!managerId) {
                        console.log(`Error: No managerId found for ${b.customerName}`);
                        continue;
                    }

                    await EMIRecommendation.create({
                        borrowerId: b._id,
                        managerId,
                        riskLevel: 'High (Auto-Revised)',
                        suggestedEMI: newSuggestion.suggestedEMI,
                        extendedTenure: newSuggestion.extendedTenure,
                        gracePeriod: newSuggestion.gracePeriod,
                        status: 'Pending'
                    });

                    b.emiPlanStatus = 'pending';
                    await b.save();
                    console.log(`Successfully generated Plan B for ${b.customerName}`);
                } else {
                    console.log(`Plan B already exists for ${b.customerName}`);
                    // Ensure borrower status is synced
                    if (b.emiPlanStatus !== 'pending') {
                        b.emiPlanStatus = 'pending';
                        await b.save();
                    }
                }
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

repair();
