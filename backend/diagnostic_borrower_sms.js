import twilioService from './services/twilioService.js';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import mongoose from 'mongoose';

dotenv.config();

const testBorrowerSMS = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const borrowers = await Borrower.find({}).limit(2);

        console.log('--- Testing SMS to Borrowers ---');
        for (const b of borrowers) {
            console.log(`Sending to ${b.customerName} (${b.phoneNumber})...`);
            const result = await twilioService.sendSMS(b.phoneNumber, `Test message for ${b.customerName}`);
            console.log(`Result for ${b.customerName}:`, JSON.stringify(result, null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

testBorrowerSMS();
