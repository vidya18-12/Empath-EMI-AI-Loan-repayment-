import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const borrowers = await Borrower.find({});
        console.log('Available Borrowers:');
        borrowers.forEach(b => {
            console.log(`- Name: ${b.customerName}, Email: ${b.email || 'N/A'}, Phone: ${b.phoneNumber}, Loan ID: ${b.loanId}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

list();
