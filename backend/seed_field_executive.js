import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FieldExecutive from './models/FieldExecutive.js';

dotenv.config();

const seedFieldExecutive = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if account already exists
        const existing = await FieldExecutive.findOne({ email: 'field@loanrecovery.com' });
        if (existing) {
            console.log('Field Executive account already exists');
            process.exit();
        }

        // Create new account
        const executive = await FieldExecutive.create({
            name: 'Rahul Field',
            email: 'field@loanrecovery.com',
            password: 'password123',
            role: 'field_executive',
            phoneNumber: '9876543210'
        });

        console.log('Field Executive account created successfully:');
        console.log('Email: field@loanrecovery.com');
        console.log('Password: password123');

        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

seedFieldExecutive();
