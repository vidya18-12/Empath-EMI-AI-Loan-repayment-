import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Manager from '../models/Manager.js';
import Borrower from '../models/Borrower.js';
import Message from '../models/Message.js';
import EMIRecommendation from '../models/EMIRecommendation.js';
import FieldExecutive from '../models/FieldExecutive.js';
import Notification from '../models/Notification.js';
import BehaviorAnalysis from '../models/BehaviorAnalysis.js';
import connectDB from '../config/db.js';

dotenv.config();

// Seed data
const seedUsers = [
    {
        name: 'Admin Manager',
        email: 'admin@loanrecovery.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Recovery Manager',
        email: 'manager@loanrecovery.com',
        password: 'manager123',
        role: 'manager',
    },
];

const seedDB = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Admin.deleteMany({});
        await Manager.deleteMany({});
        await Borrower.deleteMany({});
        await Message.deleteMany({});
        await EMIRecommendation.deleteMany({});
        await FieldExecutive.deleteMany({});
        await Notification.deleteMany({});
        await BehaviorAnalysis.deleteMany({});

        console.log('👤 Creating Admins...');
        const admin = await Admin.create(seedUsers[0]);

        console.log('👤 Creating Managers...');
        const manager = await Manager.create(seedUsers[1]);

        console.log('👤 Creating specialized Field Executives...');
        const fieldLocs = ['Bengaluru', 'Mysuru', 'Udupi', 'Shivamogga', 'Belagavi', 'Mangaluru', 'Hubballi'];
        const fieldExecutives = await Promise.all(fieldLocs.map(async (loc) => {
            return await FieldExecutive.create({
                name: `${loc} Lead Executive`,
                email: `field.${loc.toLowerCase().replace(/\s+/g, '')}@loanrecovery.com`,
                password: 'field123',
                location: loc,
                phoneNumber: `+91${Math.floor(7000000000 + Math.random() * 2000000000)}`
            });
        }));
        console.log(`✅ Created ${fieldExecutives.length} Field Executives across KA`);

        console.log('📊 Creating Borrowers (with Auth)...');
        const borrowersData = [

        ];

        const borrowers = await Borrower.create(borrowersData);
        console.log('✅ Seeded Borrowers with Auth');
        console.log(`✅ Created ${borrowers.length} borrowers`);

        console.log('');
        console.log('🎉 Database seeded successfully!');
        console.log('');
        console.log('Login Credentials:');
        console.log('─────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@loanrecovery.com');
        console.log('  Password: admin123');
        console.log('');
        console.log('Manager:');
        console.log('  Email: manager@loanrecovery.com');
        console.log('  Password: manager123');
        console.log('─────────────────────────────────────');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
