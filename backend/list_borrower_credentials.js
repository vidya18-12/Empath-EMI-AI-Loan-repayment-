import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from './models/Borrower.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

const listBorrowerCredentials = async () => {
    try {
        await connectDB();

        // Fetch all borrowers with password field (normally excluded)
        const borrowers = await Borrower.find({}).select('+password');

        console.log('\n┌─────────────────────────────────────────────────────────────────┐');
        console.log('│  📧 Borrower Credentials (Email & Password)                    │');
        console.log('├─────────────────────────────────────────────────────────────────┤');
        console.log(`│  Total Borrowers: ${borrowers.length.toString().padEnd(46)}│`);
        console.log('└─────────────────────────────────────────────────────────────────┘\n');

        if (borrowers.length === 0) {
            console.log('No borrowers found in database.\n');
            return;
        }

        // Display each borrower's credentials
        borrowers.forEach((borrower, index) => {
            console.log(`${index + 1}. ${borrower.customerName}`);
            console.log(`   📧 Email: ${borrower.email}`);
            console.log(`   🔑 Password: ${borrower.password || 'Not set'}`);
            console.log(`   🆔 Loan ID: ${borrower.loanId}`);
            console.log(`   📱 Phone: ${borrower.phoneNumber}`);
            console.log('   ' + '─'.repeat(60));
        });

        console.log('\n📝 Note: Passwords are hashed using bcrypt for security.');
        console.log('   To use these credentials, you need the original unhashed passwords.\n');

        // Also save to a file
        const credentials = borrowers.map((b, i) => ({
            no: i + 1,
            name: b.customerName,
            email: b.email,
            password: b.password || 'Not set',
            loanId: b.loanId,
            phone: b.phoneNumber
        }));

        const fs = await import('fs');
        fs.default.writeFileSync(
            'borrower_credentials.json',
            JSON.stringify(credentials, null, 2)
        );

        console.log('✅ Credentials also saved to: borrower_credentials.json\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Run the script
listBorrowerCredentials();
