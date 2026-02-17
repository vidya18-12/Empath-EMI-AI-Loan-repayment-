import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAssignment = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find Recovery Manager
        const recoveryManager = await Manager.findOne({ name: 'Recovery Manager' });
        if (!recoveryManager) {
            console.error('Recovery Manager not found!');
            process.exit(1);
        }

        // Fix Sneha Reddy
        const result = await Borrower.updateOne(
            { customerName: 'Sneha Reddy' },
            { $set: { assignedManager: recoveryManager._id } }
        );

        console.log('Update Result:', result);

        // Also find any other unassigned borrowers and assign them to Recovery Manager
        const others = await Borrower.updateMany(
            { assignedManager: { $exists: false } },
            { $set: { assignedManager: recoveryManager._id } }
        );
        console.log('Bulk Update Result:', others);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAssignment();
