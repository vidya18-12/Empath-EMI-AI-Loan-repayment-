import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import Manager from './models/Manager.js';
import dotenv from 'dotenv';

dotenv.config();

// We can't easily test the express middleware without running the server, 
// but we can verify the data state to see if managers exist.
// The hypothesis is purely code-based (middleware restriction), which I can see in the file view.
// But let's confirm Managers exist to be sure.

const checkManagers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const managers = await Manager.find({});
        console.log(`\nids found: ${managers.length}`);

        if (managers.length === 0) {
            console.log('❌ NO MANAGERS FOUND - This is why defaultManagerId is empty.');
        } else {
            console.log('✅ Managers exist. The issue is likely the API permission.');
            console.log('Permission check: `router.get(\'/managers\', protect, authorize(\'admin\'), getManagers);`');
            console.log('Borrower role is \'user\', so they are BLOCKED by authorize(\'admin\').');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkManagers();
