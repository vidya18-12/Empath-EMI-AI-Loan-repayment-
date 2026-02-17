import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false }); // Strict mode false to see all fields if schema diverged

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

const listUsers = async () => {
    await connectDB();
    const users = await User.find({});
    console.log('All Users found:', users);
    process.exit();
};

listUsers();
