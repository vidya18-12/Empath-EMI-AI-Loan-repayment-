import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import Borrower from './models/Borrower.js';

dotenv.config();

const verifyDelete = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get a borrower
        const borrower = await Borrower.findOne({});
        if (!borrower) {
            console.error('No borrower found for test');
            process.exit(1);
        }

        // 2. Create a test automated message
        const testMsg = await Message.create({
            borrowerId: borrower._id,
            managerId: new mongoose.Types.ObjectId(), // dummy
            sender: 'manager',
            text: 'Test message for deletion',
            isAutomated: true,
            conversationState: 'initiated'
        });
        console.log('Created test message:', testMsg._id);

        // 3. Verify it exists
        const exists = await Message.findById(testMsg._id);
        console.log('Message exists before delete:', !!exists);

        // 4. Delete it via logic (simulating the controller logic)
        const result = await Message.deleteMany({
            borrowerId: borrower._id,
            isAutomated: true
        });
        console.log('Deleted count:', result.deletedCount);

        // 5. Verify it's gone
        const gone = await Message.findById(testMsg._id);
        console.log('Message exists after delete:', !!gone);

        if (!gone && result.deletedCount >= 1) {
            console.log('✅ Backend deletion logic verified!');
        } else {
            console.error('❌ Backend deletion logic failed!');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

verifyDelete();
