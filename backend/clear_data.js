import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const clearData = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully.\n');

        const collections = [
            'borrowers',
            'messages',
            'emirecommendations',
            'callrecords',
            'notifications',
            'behavioranalyses'
        ];

        console.log('Clearing operational data...');
        for (const collectionName of collections) {
            try {
                const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
                console.log(`- Cleared ${collectionName}: ${result.deletedCount} documents removed`);
            } catch (err) {
                console.log(`- Skipping ${collectionName} (likely already empty or doesn't exist)`);
            }
        }

        console.log('\n✅ Data extraction complete. All operational data removed.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
