import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const updateAdminEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Admin.deleteMany({ email: { $ne: 'admin@example.com' } });
        console.log(`Successfully deleted ${result.deletedCount} incorrect admin account(s).`);

        const remainingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (remainingAdmin) {
            console.log('Main admin account (admin@example.com) is healthy in database.');
        } else {
            console.warn('Main admin account not found. You may need to run seed_admin.js.');
        }

    } catch (error) {
        console.error('Error updating admin email:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

updateAdminEmail();
