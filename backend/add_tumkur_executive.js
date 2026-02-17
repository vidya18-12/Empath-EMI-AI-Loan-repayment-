import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FieldExecutive from './models/FieldExecutive.js';

dotenv.config();

const addTumkurExecutive = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if account already exists
        const existing = await FieldExecutive.findOne({ email: 'tumkur@loanrecovery.com' });
        if (existing) {
            console.log('Field Executive for Tumkur already exists');
            process.exit();
        }

        // Create new account
        const executive = await FieldExecutive.create({
            name: 'Tumkur Field Officer',
            email: 'tumkur@loanrecovery.com',
            password: 'password123',
            role: 'field_executive',
            phoneNumber: '9123456789',
            location: 'Tumkur'
        });

        console.log('Field Executive account created for Tumkur successfully!');
        console.log('Email: tumkur@loanrecovery.com');
        console.log('Password: password123');
        console.log('Location: Tumkur');

        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

addTumkurExecutive();
