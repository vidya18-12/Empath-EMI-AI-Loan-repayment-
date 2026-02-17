import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const assignManager = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB Connected');

        // 1. Find a Manager (Admin Manager or Recovery Manager)
        const manager = await Manager.findOne({});
        if (!manager) {
            console.error('❌ No managers found! Cannot assign.');
            process.exit(1);
        }
        console.log(`👔 Found Manager: ${manager.name} (${manager._id})`);

        // 2. Find Borrowers without assigned manager
        const borrowers = await Borrower.find({
            $or: [
                { assignedManager: { $exists: false } },
                { assignedManager: null }
            ]
        });

        console.log(`👥 Found ${borrowers.length} unassigned borrowers.`);

        // 3. Update them
        if (borrowers.length > 0) {
            const result = await Borrower.updateMany(
                {
                    $or: [
                        { assignedManager: { $exists: false } },
                        { assignedManager: null }
                    ]
                },
                { $set: { assignedManager: manager._id } }
            );
            console.log(`✅ Assigned manager to ${result.modifiedCount} borrowers.`);
        } else {
            console.log('✅ All borrowers already have a manager assigned.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

assignManager();
