import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const checkBorrowerStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const borrowers = await Borrower.find({});
        console.log(`Total borrowers: ${borrowers.length}`);

        borrowers.forEach(b => {
            console.log(`- ${b.customerName}: overdueDays=${b.overdueDays}, isOverdue=${b.isOverdue}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkBorrowerStatus();
