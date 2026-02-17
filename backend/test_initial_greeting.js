import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

// Mock request/response objects
const mockReq = (user, params = {}) => ({
    user,
    params,
    query: {}
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const testInitialGreeting = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // 1. Setup Data: Find a borrower and Ensure they have NO messages
        // We'll use one of the seed borrowers, e.g., Raj (if exists) or just correct the email below
        // Based on previous turn, "Kavitha" (kiran@example.com) exists.
        const borrower = await Borrower.findOne({ email: 'kiran@example.com' });
        if (!borrower) {
            console.log('❌ Test Borrower not found');
            process.exit(1);
        }

        console.log(`Testing with Borrower: ${borrower.customerName}`);

        // Clear existing messages for this borrower to simulate "First Login"
        await Message.deleteMany({ borrowerId: borrower._id });
        console.log('🧹 Cleared message history for borrower');

        // 2. Simulate getConversation call
        // We need to import the controller. 
        // Note: Controller uses exports. Assuming module type.
        const { getConversation } = await import('./controllers/messageController.js');

        // We need a manager ID to be the "otherId" in params, but the logic we added 
        // inside getConversation actually relies on req.user._id (the borrower).
        // The otherId param is technically for who they are talking to.
        // In the dashboard, it calls `/messages/${managerId}`.
        // So we need to provide a managerId in params.

        // Find a manager
        const manager = await Manager.findOne({});
        if (!manager) {
            console.log('❌ No manager found');
            process.exit(1);
        }

        const req = mockReq(
            { _id: borrower._id, role: 'user' }, // req.user
            { otherId: manager._id }             // req.params
        );
        const res = mockRes();
        const next = (err) => {
            console.error('❌ Error received in next():');
            console.error(err);
            if (err instanceof Error) {
                console.error('Stack:', err.stack);
            }
        };

        console.log('🚀 Calling getConversation...');
        await getConversation(req, res, next);

        // 3. Verify Response
        if (res.data && res.data.success) {
            const messages = res.data.data;
            console.log(`📨 Messages returned: ${messages.length}`);

            if (messages.length === 1 && messages[0].senderModel === 'Manager') {
                console.log('✅ SUCCESS: Initial greeting automatically generated!');
                console.log(`   Content: "${messages[0].content}"`);
            } else {
                console.log('❌ FAILURE: Expected 1 message from Manager');
                console.log(JSON.stringify(messages, null, 2));
            }

        } else {
            console.log('❌ Controller returned error or failure');
            console.log(res.data);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testInitialGreeting();
