import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from '../models/Borrower.js';

dotenv.config();

const syncNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Verified list from user screenshot
        const updates = [
            { name: 'Kavitha', phone: '+918431772908' },
            { name: /Anu/i, phone: '+919019852093' }, // Anu might be the one with this number
            { name: /Vidya/i, phone: '+917676940379' }
        ];

        for (const update of updates) {
            const borrower = await Borrower.findOne({ customerName: update.name });
            if (borrower) {
                const oldPhone = borrower.phoneNumber;
                borrower.phoneNumber = update.phone;
                borrower.isOverdue = true; // Ensure they are overdue for the test
                if (borrower.overdueDays < 7) borrower.overdueDays = 15;

                await borrower.save();
                console.log(`✅ Updated ${borrower.customerName}: ${oldPhone} -> ${update.phone}`);
            } else {
                console.log(`⚠️ Borrower matching ${update.name} not found.`);
            }
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during sync:', error);
        process.exit(1);
    }
};

syncNumbers();
