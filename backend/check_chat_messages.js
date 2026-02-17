import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import Borrower from './models/Borrower.js';
import connectDB from './config/db.js';

dotenv.config();

const checkChatMessages = async () => {
    try {
        await connectDB();

        // Find Vidya's borrower record
        const borrower = await Borrower.findOne({ customerName: /vidya/i });

        if (!borrower) {
            console.log('❌ Borrower not found');
            process.exit(1);
        }

        console.log(`\n📊 Checking messages for: ${borrower.customerName}`);
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Get all messages for this borrower
        const messages = await Message.find({ borrowerId: borrower._id })
            .sort({ createdAt: 1 });

        console.log(`Found ${messages.length} message(s):\n`);

        messages.forEach((msg, index) => {
            console.log(`${index + 1}. [${msg.sender}] ${msg.isAutomated ? '🤖 AUTO' : '👤 MANUAL'}`);
            console.log(`   Text: ${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}`);
            console.log(`   State: ${msg.conversationState || 'none'}`);
            console.log(`   Created: ${msg.createdAt}`);
            if (msg.metadata?.plansOffered) {
                console.log(`   ✅ HAS PLANS ATTACHED!`);
                console.log(`   Plan A EMI: ₹${msg.metadata.plansOffered.planA?.suggestedEMI}`);
                console.log(`   Plan B EMI: ₹${msg.metadata.plansOffered.planB?.suggestedEMI}`);
            }
            console.log('   ─────────────────────────────────────────────────────────────');
        });

        // Check if any message has 'plan_suggested' state
        const planMessages = messages.filter(m => m.conversationState === 'plan_suggested');
        console.log(`\n📋 Messages with plans: ${planMessages.length}`);

        if (planMessages.length === 0) {
            console.log('\n⚠️  NO PLAN MESSAGES FOUND!');
            console.log('   This means the AI logic did not generate plan suggestions.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkChatMessages();
