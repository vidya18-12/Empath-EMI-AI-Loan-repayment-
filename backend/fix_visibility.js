import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import Admin from './models/Admin.js';

dotenv.config();

const fixVisibility = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await Admin.findOne({ email: 'admin@example.com' });
        if (!admin) {
            console.error('Admin not found. Run seed_admin.js first.');
            return;
        }

        // 1. Tag all existing borrowers as uploaded by Admin
        // 2. Clear assignedManager if it was a dummy ID from previous step
        const result = await Borrower.updateMany(
            {},
            {
                uploadedBy: admin._id,
                $unset: { assignedManager: "" } // Make them "unassigned" so all managers see them
            }
        );

        console.log(`Updated ${result.modifiedCount} borrowers to be unassigned and owned by Admin.`);

    } catch (error) {
        console.error('Error fixing visibility:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixVisibility();
