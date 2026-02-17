import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for migration...');

        const map = {
            'WILL_PAY': 'NORMAL_RISK',
            'MAY_PAY': 'MODERATE_RISK',
            'RISKY': 'HIGH_RISK',
            'WILL_NOT_PAY': 'CRITICAL_RISK',
            'NO_RESPONSE': 'PENDING'
        };

        const borrowers = await Borrower.find({});
        let updatedCount = 0;

        for (const borrower of borrowers) {
            if (map[borrower.riskLevel]) {
                const oldLevel = borrower.riskLevel;
                borrower.riskLevel = map[oldLevel];
                await borrower.save();
                console.log(`Updated ${borrower.customerName}: ${oldLevel} -> ${borrower.riskLevel}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} records.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
