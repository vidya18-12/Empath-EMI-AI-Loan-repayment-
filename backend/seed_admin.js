import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@example.com';
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log('Admin already exists:', email);
        } else {
            const admin = await Admin.create({
                name: 'System Admin',
                email: email,
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin created successfully:', email);
        }

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();
