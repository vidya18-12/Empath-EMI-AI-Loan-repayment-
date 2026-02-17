import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Message from './models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const b = await Borrower.findOne({ customerName: /Rajesh Kumar/i });
        if (!b) {
            console.log('Rajesh Kumar not found');
        } else {
            console.log('Borrower Found:', {
                id: b._id,
                name: b.customerName,
                email: b.email,
                phone: b.phoneNumber,
                loanId: b.loanId,
                assignedManager: b.assignedManager,
                uploadedBy: b.uploadedBy
            });

            const count = await Message.countDocuments({
                $or: [{ senderId: b._id }, { recipientId: b._id }]
            });
            console.log('Total Message Count:', count);

            const msgs = await Message.find({
                $or: [{ senderId: b._id }, { recipientId: b._id }]
            }).sort({ createdAt: -1 }).limit(5);

            msgs.forEach(m => {
                console.log(`- [${m.createdAt}] From: ${m.senderModel}(${m.senderId}), To: ${m.recipientId}, Text: ${m.content}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

debug();
