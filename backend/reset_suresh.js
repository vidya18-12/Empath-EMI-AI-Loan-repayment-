import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const b = await Borrower.findOneAndUpdate(
            { customerName: 'Suresh Raina' },
            { password: hashedPassword },
            { new: true }
        );

        if (b) {
            console.log(`Password reset successfully for ${b.customerName}`);
        } else {
            console.log('Borrower not found');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

reset();
