import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startAutomatedOutreach } from './controllers/chatbotController.js';
import Manager from './models/Manager.js';
import Admin from './models/Admin.js';

dotenv.config();

const testOutreach = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check for Manager first, then Admin
        let user = await Manager.findOne({});
        if (!user) {
            user = await Admin.findOne({});
        }

        if (!user) {
            console.error('No user found to run test');
            process.exit(1);
        }

        console.log(`Testing with user: ${user.name} (Role: ${user.role}, ID: ${user._id})`);

        const req = {
            body: { minOverdueDays: 7, limit: 50 },
            user: user
        };

        const res = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                console.log('Response Status:', this.statusCode);
                console.log('Response JSON:', JSON.stringify(data, null, 2));
                return this;
            }
        };

        const next = (err) => {
            console.error('Next called with error:', err);
            if (err.name === 'ValidationError') {
                console.error('Validation Errors:', JSON.stringify(err.errors, null, 2));
            }
        };

        await startAutomatedOutreach(req, res, next);

        setTimeout(() => mongoose.disconnect(), 2000);
    } catch (error) {
        console.error('Error in test script:', error);
    }
};

testOutreach();
