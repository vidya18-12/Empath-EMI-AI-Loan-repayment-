import mongoose from 'mongoose';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const resetOutreach = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Message.deleteMany({
            isAutomated: true
        });

        console.log(`✅ Deleted ${result.deletedCount} automated messages.`);
        console.log('You can now re-run the automated outreach sequence from the dashboard.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

resetOutreach();
