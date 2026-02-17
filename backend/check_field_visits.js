import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';

dotenv.config();

const checkVisits = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const borrowersWithVisits = await Borrower.find({
            fieldVisits: { $exists: true, $not: { $size: 0 } }
        });

        console.log(`Found ${borrowersWithVisits.length} borrowers with field visits.`);

        borrowersWithVisits.forEach(b => {
            console.log(`Borrower: ${b.customerName}, Visits: ${b.fieldVisits.length}`);
            b.fieldVisits.forEach(v => {
                console.log(`  - Visited At: ${v.visitedAt}, Notes: ${v.notes}`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkVisits();
