import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from '../models/Borrower.js';

dotenv.config();

const checkBorrowers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const overdue = await Borrower.find({ isOverdue: true });

        console.log(`Found ${overdue.length} overdue borrowers total.`);

        const overdue7 = overdue.filter(b => b.overdueDays >= 7);
        console.log(`Found ${overdue7.length} borrowers overdue by 7+ days.`);

        overdue7.forEach(b => {
            console.log(`- ${b.customerName}: ${b.overdueDays} days, phone: ${b.phoneNumber}`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkBorrowers();
