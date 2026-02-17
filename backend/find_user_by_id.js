import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import Manager from './models/Manager.js';
import dotenv from 'dotenv';

dotenv.config();

const id = '67595304191fe427e2eab098';

const findUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const a = await Admin.findById(id);
        const m = await Manager.findById(id);

        console.log('Admin:', a ? a.name : 'Not Found');
        console.log('Manager:', m ? m.name : 'Not Found');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findUser();
