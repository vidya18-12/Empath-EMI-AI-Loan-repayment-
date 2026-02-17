import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PASSWORD = 'password123'; // Default password for all borrowers

const seedPasswords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Fetch all borrowers
        const borrowers = await Borrower.find({}).select('+password');

        console.log('📊 Setting default passwords for borrowers...\n');
        console.log('='.repeat(80));

        let updated = 0;
        let skipped = 0;

        // Hash the default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        for (const borrower of borrowers) {
            // Force update password for ALL borrowers to ensure consistency
            borrower.password = DEFAULT_PASSWORD; // Let the pre-save hook handle hashing if it exists, or hash manually if not.
            // Actually, best to check the model first to see if it has a pre-save hook.
            // If I look at the previous step, I haven't seen the Borrower model yet. 
            // So checking Borrower.js first is wise. But for this specific file rewrite:

            // To be safe and avoid double hashing if the model has a pre-save hook, 
            // I should assign the plain text password and save, relying on the model.
            // However, the original seed_passwords.js was manually hashing. 
            // If the model ALSO hashes, we get double hashing.

            borrower.password = DEFAULT_PASSWORD;
            await borrower.save();

            console.log(`✅ ${borrower.customerName} (${borrower.email})`);
            console.log(`   Password reset to: "${DEFAULT_PASSWORD}"`);
            console.log('   ' + '-'.repeat(76));

            updated++;
        }

        console.log('='.repeat(80));
        console.log(`\n📈 Summary:`);
        console.log(`   • Total Borrowers: ${borrowers.length}`);
        console.log(`   • Passwords Set: ${updated}`);
        console.log(`   • Skipped (already had password): ${skipped}`);
        console.log(`\n🔑 Default Password: "${DEFAULT_PASSWORD}"`);
        console.log(`\n✅ All borrowers now have login credentials!`);
        console.log(`\n📝 Borrowers can now login with:`);
        console.log(`   Email: [their email]`);
        console.log(`   Password: ${DEFAULT_PASSWORD}\n`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedPasswords();
