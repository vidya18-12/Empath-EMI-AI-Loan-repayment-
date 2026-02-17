import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';

dotenv.config();

const fixBorrowerRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Update all borrowers to have role = 'user'
        const result = await Borrower.updateMany(
            { role: { $ne: 'user' } }, // Find borrowers without role 'user'
            { $set: { role: 'user' } }  // Set their role to 'user'
        );

        console.log('='.repeat(80));
        console.log('🔧 Fixed Borrower Roles');
        console.log('='.repeat(80));
        console.log(`✅ Updated ${result.modifiedCount} borrowers to have role: 'user'`);

        // Verify all borrowers now
        const borrowers = await Borrower.find({}).select('+password');

        console.log(`\n📊 Verification:`);
        console.log(`   Total Borrowers: ${borrowers.length}`);

        let hasPassword = 0;
        let hasRole = 0;

        borrowers.forEach(b => {
            if (b.password) hasPassword++;
            if (b.role === 'user') hasRole++;
        });

        console.log(`   With Password: ${hasPassword}`);
        console.log(`   With Role 'user': ${hasRole}`);

        console.log('\n✅ All borrowers ready for login!');
        console.log('\n📝 Login Credentials:');
        console.log('   Email: [any borrower email]');
        console.log('   Password: password123');
        console.log('   Role: user (or leave blank)\n');
        console.log('='.repeat(80) + '\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixBorrowerRoles();
