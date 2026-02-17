import mongoose from 'mongoose';
import Message from './models/Message.js';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const checkMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const borrowers = await Borrower.find({});

        for (const b of borrowers) {
            const lastAutomatedMessage = await Message.findOne({
                borrowerId: b._id,
                isAutomated: true
            }).sort({ createdAt: -1 });

            if (lastAutomatedMessage) {
                const hoursSinceLastMessage = (new Date() - new Date(lastAutomatedMessage.createdAt)) / (1000 * 60 * 60);
                console.log(`- ${b.customerName}: Last automated message at ${lastAutomatedMessage.createdAt} (${hoursSinceLastMessage.toFixed(2)} hours ago)`);
            } else {
                console.log(`- ${b.customerName}: No automated messages found`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkMessages();
