import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
dotenv.config();

async function reset() {
    await mongoose.connect(process.env.MONGODB_URI);
    const b = await Borrower.findOne({ email: 'suresh.raina@example.com' });
    if (b) {
        b.riskLevel = 'PENDING';
        await b.save();
        console.log('Reset Suresh Raina riskLevel to PENDING');
    }
    process.exit();
}
reset();
