import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';

dotenv.config();

const createTestBorrower = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const phoneNumber = '7676940379'; // The verified number found in Twilio
        const loanId = 'TEST' + Math.floor(1000 + Math.random() * 9000);

        // Check if borrower already exists
        let borrower = await Borrower.findOne({ phoneNumber });

        if (borrower) {
            console.log('Updating existing borrower with verified number...');
            borrower.isOverdue = true;
            borrower.overdueDays = 15;
            borrower.customerName = 'Test User (Verified)';
            await borrower.save();
        } else {
            console.log('Creating new test borrower with verified number...');
            borrower = await Borrower.create({
                customerName: 'Test User (Verified)',
                email: 'testuser@example.com',
                phoneNumber: phoneNumber,
                loanId: loanId,
                loanAmount: 50000,
                isOverdue: true,
                overdueDays: 15, // Ensure it's above the default limit (7)
                riskLevel: 'Moderate'
            });
        }

        console.log('✅ Test Borrower Ready:');
        console.log(`- Name: ${borrower.customerName}`);
        console.log(`- Phone: ${borrower.phoneNumber}`);
        console.log(`- Overdue: ${borrower.overdueDays} days`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error creating test borrower:', error);
    }
};

createTestBorrower();
