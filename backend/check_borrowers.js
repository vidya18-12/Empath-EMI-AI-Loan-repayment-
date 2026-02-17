import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import connectDB from './config/db.js';

dotenv.config();

const checkBorrowers = async () => {
    try {
        await connectDB();

        const borrowers = await Borrower.find({
            customerName: { $in: ['Anu', 'Kavitha', 'Vidya'] }
        }).select('+password');

        console.log('\n📋 Borrower Details:');
        console.log('═════════════════════════════════════════════════════════════');

        if (borrowers.length === 0) {
            console.log('❌ No borrowers found with names: Anu, Kavitha, Vidya');
        } else {
            borrowers.forEach(b => {
                console.log(`\n👤 Name: ${b.customerName}`);
                console.log(`   Email: ${b.email || 'Not set'}`);
                console.log(`   Phone: ${b.phoneNumber || 'Not set'}`);
                console.log(`   Loan ID: ${b.loanId || 'Not set'}`);
                console.log(`   Password: ${b.password ? '✅ Set (can login)' : '❌ Not set (cannot login)'}`);
                console.log(`   Role: ${b.role || 'user'}`);
                console.log('   ─────────────────────────────────────────────');
            });
        }

        console.log('\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkBorrowers();
