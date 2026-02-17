import mongoose from 'mongoose';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const inspectMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const messages = await Message.find({ isAutomated: true })
            .sort({ createdAt: -1 })
            .limit(5);

        console.log(`Found ${messages.length} automated messages:`);
        messages.forEach(m => {
            console.log(`- ID: ${m._id}`);
            console.log(`  To: ${m.borrowerId}`);
            console.log(`  Time: ${m.createdAt}`);
            console.log(`  Text: ${m.text.substring(0, 50)}...`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

inspectMessages();
