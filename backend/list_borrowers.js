import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';
import dotenv from 'dotenv';
import fs from 'fs'; // Added fs import

dotenv.config();

// Function to connect to the database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};

const listBorrowers = async () => {
    try {
        await connectDB();

        // Fetch all borrowers including password field
        const borrowers = await Borrower.find({}).select('+password');

        console.log('\n' + '='.repeat(80));
        console.log('📊 BORROWER CREDENTIALS LIST');
        console.log('='.repeat(80));
        console.log(`Total Borrowers: ${borrowers.length}\n`);

        const credentials = [];

        borrowers.forEach((b, index) => {
            console.log(`${index + 1}. ${b.customerName}`);
            console.log(`   📧 Email: ${b.email}`);
            console.log(`   🔑 Password: ${b.password ? '(Hashed - bcrypt)' : 'Not set'}`);
            console.log(`   🆔 Loan ID: ${b.loanId}`);
            console.log(`   💰 Loan Amount: ₹${b.loanAmount?.toLocaleString()}`);
            console.log(`   📱 Phone: ${b.phoneNumber}`);
            console.log(`   ⚠️  Overdue Days: ${b.overdueDays || 0}`);
            console.log(`   📊 Risk Level: ${b.riskLevel || 'PENDING'}`);
            console.log('   ' + '-'.repeat(76));

            credentials.push({
                no: index + 1,
                name: b.customerName,
                email: b.email,
                hashedPassword: b.password ? 'HASHED_BY_BCRYPT' : 'NOT_SET',
                loanId: b.loanId,
                phone: b.phoneNumber,
                loanAmount: b.loanAmount,
                overdueDays: b.overdueDays || 0,
                riskLevel: b.riskLevel || 'PENDING'
            });
        });

        // Save to JSON file
        fs.writeFileSync(
            'borrower_credentials.json',
            JSON.stringify(credentials, null, 2),
            'utf8'
        );

        console.log('\n✅ Credentials saved to: borrower_credentials.json');
        console.log('\n⚠️  IMPORTANT NOTES:');
        console.log('   • Passwords are hashed using bcrypt (cannot be decrypted)');
        console.log('   • If you need plain text passwords for testing, they should be');
        console.log('     set during registration or seeding');
        console.log('   • For testing: Use the Register page to create test accounts\n');

        console.log('='.repeat(80) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listBorrowers();
