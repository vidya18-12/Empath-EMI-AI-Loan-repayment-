import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import { analyzeSentiment } from './services/aiService.js';

dotenv.config();

const testSendMessageLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get or create a manager
        let manager = await Manager.findOne();
        if (!manager) {
            manager = await Manager.create({
                name: 'Test Manager',
                email: 'manager_test@example.com',
                password: 'password123',
                role: 'manager'
            });
        }

        // Get or create a borrower
        let borrower = await Borrower.findOne();
        if (!borrower) {
            borrower = await Borrower.create({
                customerName: 'Test Borrower',
                email: 'borrower_test@example.com',
                phoneNumber: '1234567890',
                loanId: 'TEST001',
                loanAmount: 10000,
                dueDate: new Date(),
                assignedManager: manager._id
            });
        }

        const content = "I lost my job and I'm stressed.";
        const recipientId = manager._id;

        // Mock req.user
        const reqUser = { _id: borrower._id, role: 'user' };

        // Logic from sendMessage controller
        const isBorrower = reqUser.role === 'user';
        const sentimentData = isBorrower ? analyzeSentiment(content) : { sentiment: 'Unknown', score: 0 };

        console.log('Sentiment Data:', sentimentData);

        let messageData = {
            sentiment: sentimentData.sentiment,
            riskScore: sentimentData.score,
            isAutomated: false,
            borrowerId: reqUser._id,
            managerId: recipientId,
            sender: 'borrower',
            text: content
        };

        console.log('Attempting to create message with data:', messageData);

        const message = await Message.create(messageData);
        console.log('✅ Message created successfully:', message._id);

        // Cleanup
        await Message.deleteOne({ _id: message._id });
        console.log('Cleaned up test message');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.errors) {
            console.error('Validation errors:', Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`));
        }
    } finally {
        await mongoose.disconnect();
    }
};

testSendMessageLogic();
