import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const checkSneha = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const b = await Borrower.findOne({ customerName: 'Sneha Reddy' });

        console.log('CustomerName:', b.customerName);
        console.log('AssignedManager:', b.assignedManager);
        console.log('UploadedBy:', b.uploadedBy);
        process.exit(0);
    } catch (error) {
        process.error('Error:', error);
        process.exit(1);
    }
};

checkSneha();
