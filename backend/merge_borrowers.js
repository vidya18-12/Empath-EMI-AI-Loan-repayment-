import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Message from './models/Message.js';
import EMIRecommendation from './models/EMIRecommendation.js';
import dotenv from 'dotenv';

dotenv.config();

const mergeDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find all borrowers
        const allBorrowers = await Borrower.find({});

        // Group by Name
        const groups = {};
        allBorrowers.forEach(b => {
            const name = b.customerName.toLowerCase().trim();
            if (!groups[name]) groups[name] = [];
            groups[name].push(b);
        });

        for (const name in groups) {
            const group = groups[name];
            if (group.length > 1) {
                console.log(`Potential duplicate group for: ${name}`);

                // Find the one with a password (Registered) and the one with Loan details (Uploaded)
                const registered = group.find(b => b.password);
                const uploaded = group.find(b => !b.password && b.loanId);

                if (registered && uploaded && registered._id.toString() !== uploaded._id.toString()) {
                    console.log(`Merging Uploaded (${uploaded._id}) into Registered (${registered._id})`);

                    // Copy loan details to Registered
                    registered.loanId = uploaded.loanId;
                    registered.phoneNumber = uploaded.phoneNumber;
                    registered.loanAmount = uploaded.loanAmount;
                    registered.dueDate = uploaded.dueDate;
                    registered.lastPaymentDate = uploaded.lastPaymentDate;
                    registered.overdueDays = uploaded.overdueDays;
                    registered.isOverdue = uploaded.isOverdue;
                    registered.uploadedBy = uploaded.uploadedBy;
                    registered.assignedManager = uploaded.assignedManager;
                    registered.emiPlanStatus = uploaded.emiPlanStatus;
                    registered.riskLevel = uploaded.riskLevel;
                    registered.callStatus = uploaded.callStatus;

                    await registered.save();

                    // Update all messages that pointed to Uploaded to point to Registered
                    await Message.updateMany({ recipientId: uploaded._id }, { recipientId: registered._id });
                    await Message.updateMany({ senderId: uploaded._id }, { senderId: registered._id });

                    // Update recommendations
                    await EMIRecommendation.updateMany({ borrowerId: uploaded._id }, { borrowerId: registered._id });

                    // Delete the uploaded one
                    await Borrower.deleteOne({ _id: uploaded._id });

                    console.log(`Successfully merged ${name}`);
                }
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error merging duplicates:', error);
    }
};

mergeDuplicates();
