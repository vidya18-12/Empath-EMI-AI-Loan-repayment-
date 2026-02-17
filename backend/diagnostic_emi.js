import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import EMIRecommendation from './models/EMIRecommendation.js';
import dotenv from 'dotenv';

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const b = await Borrower.findOne({ customerName: /Rajesh Kumar/i });
        if (!b) {
            console.log('Rajesh Kumar not found');
        } else {
            console.log('Borrower Found:', {
                id: b._id,
                emiPlanStatus: b.emiPlanStatus
            });

            const recs = await EMIRecommendation.find({ borrowerId: b._id }).sort({ createdAt: -1 });
            console.log(`Total Recommendations: ${recs.length}`);

            recs.forEach((r, i) => {
                console.log(`[${i}] Status: ${r.status}, Risk: ${r.riskLevel}, EMI: ${r.suggestedEMI}, CreatedAt: ${r.createdAt}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

debug();
