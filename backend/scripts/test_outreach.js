import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Borrower from '../models/Borrower.js';
import Message from '../models/Message.js';
import Manager from '../models/Manager.js';
import aiChatService from '../services/aiChatService.js';
import twilioService from '../services/twilioService.js';

dotenv.config();

const testOutreach = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const manager = await Manager.findOne({ email: 'manager@loanrecovery.com' });
        const overdueBorrowers = await Borrower.find({
            isOverdue: true,
            overdueDays: { $gte: 7 }
        }).limit(5);

        console.log(`Found ${overdueBorrowers.length} overdue borrowers\n`);

        for (const borrower of overdueBorrowers) {
            console.log(`\n--- Processing: ${borrower.customerName} ---`);
            console.log(`Phone: ${borrower.phoneNumber}`);
            console.log(`Overdue: ${borrower.overdueDays} days`);

            const messageText = aiChatService.generateInitialMessage(borrower);
            console.log(`Message: ${messageText.substring(0, 50)}...`);

            const smsResult = await twilioService.sendSMS(borrower.phoneNumber, messageText);

            if (smsResult.success) {
                console.log(`✅ SMS SENT successfully!`);
                if (smsResult.sid) console.log(`   Twilio SID: ${smsResult.sid}`);

                await Message.create({
                    borrowerId: borrower._id,
                    managerId: manager._id,
                    sender: 'manager',
                    text: messageText,
                    isRead: false,
                    isAutomated: true,
                    conversationState: 'initiated'
                });
                console.log(`✅ Message saved to database`);
            } else {
                console.log(`❌ SMS FAILED: ${smsResult.error}`);
            }
        }

        console.log('\n\n🎉 Test complete! Check the phone numbers for messages.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testOutreach();
