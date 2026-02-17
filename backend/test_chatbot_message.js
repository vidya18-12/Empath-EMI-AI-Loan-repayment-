import mongoose from 'mongoose';
import Message from './models/Message.js';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import dotenv from 'dotenv';

dotenv.config();

const testChatbotMessage = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Find Sneha's borrower record
        const borrower = await Borrower.findOne({ email: 'sneha@example.com' });
        if (!borrower) {
            console.log('❌ Borrower not found!');
            process.exit(1);
        }

        // Find a manager
        const manager = await Manager.findOne({});
        if (!manager) {
            console.log('❌ No manager found!');
            process.exit(1);
        }

        console.log('='.repeat(80));
        console.log('🧪 Creating Test Chatbot Message');
        console.log('='.repeat(80));
        console.log(`Borrower: ${borrower.customerName} (${borrower.email})`);
        console.log(`Manager: ${manager.name} (${manager.email})`);
        console.log('');

        // Create a test chatbot message (from manager to borrower)
        const testMessage = await Message.create({
            borrowerId: borrower._id,
            managerId: manager._id,
            sender: 'manager',
            text: 'Hello! This is an automated test message from the AI chatbot. Your payment is overdue. How can we help you?',
            isRead: false,
            isAutomated: true,
            conversationState: 'initiated',
            sentiment: 'neutral'
        });

        console.log('✅ Test message created!');
        console.log(`Message ID: ${testMessage._id}`);
        console.log(`Text: ${testMessage.text}`);
        console.log('');

        // Verify the message can be retrieved
        const messages = await Message.find({
            $or: [
                { borrowerId: borrower._id, managerId: manager._id },
                { senderId: borrower._id, recipientId: manager._id },
                { senderId: manager._id, recipientId: borrower._id }
            ]
        }).sort({ createdAt: 1 });

        console.log(`📊 Total messages in conversation: ${messages.length}`);
        messages.forEach((msg, idx) => {
            const sender = msg.sender || (msg.senderModel === 'Manager' ? 'manager' : 'borrower');
            const content = msg.text || msg.content;
            console.log(`  ${idx + 1}. From ${sender}: ${content.substring(0, 50)}...`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ Test Complete!');
        console.log('Now check the borrower dashboard at http://localhost:5173/borrower-dashboard');
        console.log('Login as sneha@example.com / password123');
        console.log('='.repeat(80) + '\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

testChatbotMessage();
