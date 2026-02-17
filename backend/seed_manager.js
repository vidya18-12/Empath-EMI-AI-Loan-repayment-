import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Manager from './models/Manager.js';

dotenv.config();

const seedManager = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'manager@example.com';
        const existingManager = await Manager.findOne({ email });

        if (existingManager) {
            console.log('Manager already exists:', email);
        } else {
            const manager = await Manager.create({
                name: 'Recovery Manager',
                email: email,
                password: 'manager123',
                role: 'manager'
            });
            console.log('Manager created successfully:', email);
            console.log('Password: manager123');
        }

    } catch (error) {
        console.error('Error seeding manager:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedManager();
