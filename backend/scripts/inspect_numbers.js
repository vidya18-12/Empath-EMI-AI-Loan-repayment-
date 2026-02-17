import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from '../models/Borrower.js';

dotenv.config();

const inspectNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const list = await Borrower.find({
            customerName: { $in: ['Kavitha', 'anu', 'vidya', 'Anu', 'Vidya'] }
        });

        console.log('--- Inspecting Phone Numbers ---');
        list.forEach(b => {
            console.log(`Name: ${b.customerName}`);
            console.log(`Phone: '${b.phoneNumber}'`); // Single quotes to see whitespace
            console.log(`Length: ${b.phoneNumber.length}`);
            console.log(`Is E.164: ${/^\+?[1-9]\d{1,14}$/.test(b.phoneNumber)}`);
            console.log('---');
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

inspectNumbers();
