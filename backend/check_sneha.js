import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const checkSneha = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const b = await Borrower.findOne({ customerName: 'Sneha Reddy' });

        console.log('Borrower Found:', JSON.stringify(b, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSneha();
