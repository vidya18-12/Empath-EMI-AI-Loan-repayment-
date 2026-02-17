import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from '../models/Borrower.js';

dotenv.config();

const verifyBorrowers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const overdue = await Borrower.find({
            isOverdue: true,
            overdueDays: { $gte: 7 }
        }).select('customerName phoneNumber overdueDays');

        console.log(`Found ${overdue.length} borrowers ready for automated outreach:\n`);

        overdue.forEach((b, i) => {
            console.log(`${i + 1}. ${b.customerName}`);
            console.log(`   Phone: ${b.phoneNumber}`);
            console.log(`   Overdue: ${b.overdueDays} days\n`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyBorrowers();
