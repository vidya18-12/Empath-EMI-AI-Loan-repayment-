import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const b = await Borrower.findOne({ customerName: 'Suresh Raina' }).select('+password');
        if (b) {
            console.log(`Borrower: ${b.customerName}, Has Password: ${!!b.password}`);
        } else {
            console.log('Suresh Raina not found');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

check();
