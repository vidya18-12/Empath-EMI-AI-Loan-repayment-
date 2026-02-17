import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const b = await Borrower.findOne({ email: 'suresh.raina@example.com' });
    console.log('Suresh Raina Risk Level:', b.riskLevel);
    console.log('Suresh Raina EMI Plan Status:', b.emiPlanStatus);
    process.exit();
}
check();
