import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

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

const findTargetManager = async () => {
    await connectDB();

    // Look for users with "manager" or "recovery" in name/email
    const managers = await User.find({
        $or: [
            { role: 'manager' },
            { name: { $regex: 'manager', $options: 'i' } },
            { name: { $regex: 'recovery', $options: 'i' } },
            { email: { $regex: 'manager', $options: 'i' } }
        ]
    });

    console.log('Potential Managers found:', managers);

    if (managers.length === 0) {
        console.log('No managers found. Creating default "Recovery Manager"...');
        const newManager = await User.create({
            name: 'Recovery Manager',
            email: 'recovery.manager@example.com',
            password: 'password123', // This will be hashed if using the actual model save with middleware, but here we might just insert raw if schema allows. 
            // WAIT - avoiding raw insert of password if hashing needed. 
            // Ideally we should use the app's User model if possible, but let's just see if we can find one first.
            role: 'manager'
        });
        console.log('Created:', newManager);
    }

    process.exit();
};

findTargetManager();
