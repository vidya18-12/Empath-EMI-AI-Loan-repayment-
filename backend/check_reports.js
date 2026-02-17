import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';
import connectDB from './config/db.js';

dotenv.config();

const checkReports = async () => {
    try {
        await connectDB();
        const count = await Report.countDocuments();
        console.log(`Total Reports: ${count}`);
        const reports = await Report.find();
        console.log('Reports:', reports);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkReports();
