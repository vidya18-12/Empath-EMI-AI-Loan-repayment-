import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Manager from './models/Manager.js';
import Borrower from './models/Borrower.js';
import FieldExecutive from './models/FieldExecutive.js';

dotenv.config();

const searchAllRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const roles = [
            { name: 'Admin', model: Admin },
            { name: 'Manager', model: Manager },
            { name: 'Borrower', model: Borrower },
            { name: 'FieldExecutive', model: FieldExecutive }
        ];

        for (const role of roles) {
            const users = await role.model.find({});
            console.log(`\n--- ${role.name}s (${users.length}) ---`);
            users.forEach(u => {
                console.log(`- ${u.customerName || u.name || u.email}: ${u.phoneNumber || u.phone || 'No phone'}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

searchAllRoles();
