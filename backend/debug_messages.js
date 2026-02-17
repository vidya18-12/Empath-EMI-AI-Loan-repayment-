import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const debugMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const name = 'Rajesh Kumar';
        const borrower = await Borrower.findOne({ customerName: new RegExp(name, 'i') });

        if (!borrower) {
            console.log(`Borrower ${name} not found`);
            await mongoose.disconnect();
            return;
        }

        console.log(`Found Borrower: ${borrower.customerName} (_id: ${borrower._id})`);
        console.log(`Assigned Manager: ${borrower.assignedManager}`);
        console.log(`Uploaded By: ${borrower.uploadedBy}`);

        const messages = await Message.find({
            $or: [
                { recipientId: borrower._id },
                { senderId: borrower._id }
            ]
        });

        console.log(`Total messages for ${name}: ${messages.length}`);
        messages.forEach(m => {
            console.log(`- From: ${m.senderId} (${m.senderModel}), To: ${m.recipientId}, Content: ${m.content}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

debugMessages();
