import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DEFAULT_PASSWORD = 'password123';

const resetAllPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Clear all existing passwords first
        await Borrower.updateMany({}, { $unset: { password: "" } });
        console.log('🗑️  Cleared all existing passwords\n');

        // Get all borrowers
        const borrowers = await Borrower.find({});

        console.log('='.repeat(80));
        console.log('🔄 Resetting ALL Borrower Passwords');
        console.log('='.repeat(80));

        for (const borrower of borrowers) {
            // Set the plain password - the pre-save middleware will hash it
            borrower.password = DEFAULT_PASSWORD;
            borrower.role = 'user';  // Ensure role is set
            await borrower.save();

            console.log(`✅ ${borrower.customerName} (${borrower.email})`);
            console.log(`   Password: password123`);
            console.log(`   Role: ${borrower.role}`);
            console.log(`   Loan ID: ${borrower.loanId}`);
            console.log('   ' + '-'.repeat(76));
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Successfully reset passwords for ${borrowers.length} borrowers!`);
        console.log(`\n🔑 All borrowers can now login with:`);
        console.log(`   Email: [their email]`);
        console.log(`   Password: password123\n`);
        console.log('='.repeat(80) + '\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

resetAllPasswords();
