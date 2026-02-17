import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';

dotenv.config();

const seedVisits = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find some borrowers to add visits to
        const borrowers = await Borrower.find({ riskLevel: { $in: ['HIGH_RISK', 'CRITICAL_RISK'] } }).limit(3);

        if (borrowers.length === 0) {
            console.log('No eligible borrowers found. Please ensure you have uploaded data.');
            process.exit(0);
        }

        const mockVisits = [
            {
                photoUrl: 'https://images.unsplash.com/photo-1541888941259-7727da896023?auto=format&fit=crop&w=400&q=80',
                latitude: 15.3647,
                longitude: 75.1240,
                notes: 'Residency verified. Subject was cooperative but cited medical expenses for the delay. Proposed a 3-part restructure.',
                visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                photoUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=400&q=80',
                latitude: 15.3617,
                longitude: 75.1140,
                notes: 'Business premises inspected. Stock levels are high but footfall is low. Recommended partial payment by weekend.',
                visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            }
        ];

        // Add visits to the first two borrowers
        for (let i = 0; i < Math.min(borrowers.length, 2); i++) {
            borrowers[i].fieldVisits.push(mockVisits[i]);
            await borrowers[i].save();
            console.log(`Added mock visit for: ${borrowers[i].customerName}`);
        }

        console.log('Mock intelligence transmission complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedVisits();
