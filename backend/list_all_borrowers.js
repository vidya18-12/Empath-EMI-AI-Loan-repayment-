import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';
import connectDB from './config/db.js';

dotenv.config();

const checkBorrowers = async () => {
    try {
        await connectDB();

        const borrowers = await Borrower.find({}).select('+password').sort({ customerName: 1 });

        console.log('\n📋 ALL BORROWERS IN DATABASE:');
        console.log('═══════════════════════════════════════════════════════════════════════════════════');

        if (borrowers.length === 0) {
            console.log('❌ No borrowers found in database');
        } else {
            console.log(`Found ${borrowers.length} borrower(s):\n`);

            borrowers.forEach((b, index) => {
                console.log(`${index + 1}. ${b.customerName || 'Unnamed'}`);
                console.log(`   📧 Email: ${b.email || 'Not set'}`);
                console.log(`   📱 Phone: ${b.phoneNumber || 'Not set'}`);
                console.log(`   🆔 Loan ID: ${b.loanId || 'Not set'}`);
                console.log(`   🔐 Password: ${b.password ? '✅ SET - Can login' : '❌ NOT SET - Cannot login yet'}`);
                console.log(`   👤 Role: ${b.role || 'user'}`);

                if (b.password) {
                    console.log(`\n   LOGIN CREDENTIALS:`);
                    console.log(`   Email: ${b.email}`);
                    console.log(`   Password: <encrypted - user must know their password>`);
                }
                console.log('   ─────────────────────────────────────────────────────────────────────────────');
            });

            console.log('\n💡 NOTE: Borrowers can register using the /register page if they have an email in the system.');
            console.log('   They will need to use the same email that appears above to register.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkBorrowers();
