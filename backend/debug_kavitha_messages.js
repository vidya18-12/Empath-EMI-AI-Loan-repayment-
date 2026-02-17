import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const debugKavitha = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // 1. Find Kavitha
        const borrower = await Borrower.findOne({ email: 'kiran@example.com' });
        if (!borrower) {
            console.log('❌ Kavitha not found in DB');
            return;
        }

        console.log('👤 Borrower Details:');
        console.log(`   ID: ${borrower._id}`);
        console.log(`   Name: ${borrower.customerName}`);
        console.log(`   Assigned Manager: ${borrower.assignedManager}`);
        console.log(`   Uploaded By: ${borrower.uploadedBy}`);

        // 2. Find any Managers
        const managers = await Manager.find({});
        console.log(`\n👔 Total Managers: ${managers.length}`);
        managers.forEach(m => console.log(`   - ${m.name} (${m._id})`));

        // 3. Find Messages
        const messages = await Message.find({ borrowerId: borrower._id });
        console.log(`\n📨 Messages for Kavitha: ${messages.length}`);

        messages.forEach(m => {
            console.log(`   - [${m.sender}] State: ${m.conversationState}, Content: "${m.text.substring(0, 50)}..."`);
            console.log(`     ManagerId in Msg: ${m.managerId}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugKavitha();
