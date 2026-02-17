import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedReport = async () => {
    try {
        await connectDB();

        // Find an admin or any user
        const user = await User.findOne({ role: 'admin' }) || await User.findOne();

        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        await Report.create({
            title: 'Sample Field Report - Q1 2026',
            url: 'uploads/sample-report.csv', // Dummy path
            uploadedBy: user._id,
            type: 'visit_history_csv',
            createdAt: new Date()
        });

        console.log('Dummy report seeded successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedReport();
