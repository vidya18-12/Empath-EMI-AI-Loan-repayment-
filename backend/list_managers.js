import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const listManagers = async () => {
    await connectDB();
    const managers = await User.find({ role: 'manager' });
    console.log('Managers found:', managers);
    process.exit();
};

listManagers();

listManagers();
