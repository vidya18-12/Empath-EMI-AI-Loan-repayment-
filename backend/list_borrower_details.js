import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const listDetails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const borrowers = await Borrower.find({});
        console.log('--- All Borrowers ---');
        borrowers.forEach(b => {
            console.log(`Name: ${b.customerName}, Phone: ${b.phoneNumber}, LoanID: ${b.loanId}, Overdue: ${b.overdueDays}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

listDetails();
