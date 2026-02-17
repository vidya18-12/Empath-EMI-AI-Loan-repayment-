import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const email = 'kiran@example.com';
        const password = 'password123';

        console.log(`\nTesting login for: ${email}`);

        // 1. Find User
        const borrower = await Borrower.findOne({ email }).select('+password');

        if (!borrower) {
            console.log('❌ Borrower not found');
            return;
        }

        console.log('✅ Borrower found');
        console.log(`   Stored Hash: ${borrower.password}`);

        // 2. Compare Password directly using bcrypt
        const isMatch = await bcrypt.compare(password, borrower.password);
        console.log(`\nDirect bcrypt.compare('${password}', hash): ${isMatch}`);

        if (isMatch) {
            console.log('✅ Password verification SUCCESS');
        } else {
            console.log('❌ Password verification FAILED');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testLogin();
