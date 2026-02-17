import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const borrowers = await Borrower.find({});
        for (const b of borrowers) {
            process.stdout.write(`${b.customerName} | ${b.email || 'NO_EMAIL'} | ${b.phoneNumber} | ${b.loanId}\n`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

list();
