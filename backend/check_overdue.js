import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
dotenv.config();

const checkBorrowers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Borrower.countDocuments({
            isOverdue: true,
            overdueDays: { $gte: 7 }
        });
        console.log(`Overdue borrowers (7+ days): ${count}`);

        if (count > 0) {
            const borrowers = await Borrower.find({
                isOverdue: true,
                overdueDays: { $gte: 7 }
            }).limit(5);
            borrowers.forEach(b => {
                console.log(`- ${b.customerName} (${b.phoneNumber}): ${b.overdueDays} days`);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkBorrowers();
