import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { runDailyUpdateNow } from '../services/scheduler.js';

dotenv.config();

const testScheduler = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('Running daily update logic...');
        await runDailyUpdateNow();

        console.log('✅ Update complete.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testScheduler();
