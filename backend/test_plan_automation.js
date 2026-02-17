import behavioralScoring from './services/behavioralScoring.js';
import aiChatService from './services/aiChatService.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Borrower from './models/Borrower.js';

dotenv.config();

/**
 * Test Automated Plan Delivery Trigger
 */
const testPlanTrigger = async () => {
    console.log('\n🧪 Testing Automated EMI Plan Delivery Trigger...');
    console.log('═══════════════════════════════════════════════════════════\n');

    const message = "I'll pay by this weekend, just waiting for my salary";

    const mockBorrower = {
        _id: new mongoose.Types.ObjectId(),
        customerName: "Neha",
        loanAmount: 100000,
        emiAmount: 2664,
        outstandingBalance: 86740,
        overdueDays: 11087, // Matching the screenshot
        isOverdue: true
    };

    console.log(`💬 Input Message: "${message}"`);

    try {
        // 1. Get analysis
        const comprehensiveAnalysis = await behavioralScoring.calculateComprehensiveScore({
            message,
            borrower: mockBorrower,
            responseTime: 0
        });

        console.log(`✅ Stress Level: ${comprehensiveAnalysis.stressLevel}`);
        console.log(`✅ Composite Score: ${comprehensiveAnalysis.compositeScore}`);

        // 2. Simulate Trigger Logic from messageController.js
        const sentimentData = { score: comprehensiveAnalysis.compositeScore };
        const explicitlyAskedForPlans = aiChatService.detectPlanRequest(message);

        // Match new logic in messageController.js
        const isOverdueEnough = (mockBorrower.overdueDays || 0) > 7;
        const isDistressed = ['Moderate', 'High', 'Critical'].includes(comprehensiveAnalysis.stressLevel) ||
            (comprehensiveAnalysis.stressLevel === 'Low' && isOverdueEnough);

        const showsFinancialDistress = isDistressed || explicitlyAskedForPlans || sentimentData.score > 70;

        console.log(`📡 Trigger Evaluation:`);
        console.log(`   - Is Overdue Sufficiently (>7d): ${isOverdueEnough}`);
        console.log(`   - Is Distressed (incl. Low-Overdue sync): ${isDistressed}`);
        console.log(`   - Explicitly Asked: ${explicitlyAskedForPlans}`);
        console.log(`   - High Sentiment Score (>70): ${sentimentData.score > 70}`);
        console.log(`👉 RESULT: ${showsFinancialDistress ? '🚀 TRIGGERING PLANS' : '❌ Generic Reply'}`);

        if (showsFinancialDistress) {
            const { planA, planB } = aiChatService.generateEMIPlans(mockBorrower, comprehensiveAnalysis.stressLevel);
            const response = aiChatService.generateResponseWithPlans(mockBorrower, comprehensiveAnalysis, planA, planB);
            console.log('\n💬 AI AUTOMATED RESPONSE:');
            console.log('-------------------------');
            console.log(response);
        }

    } catch (error) {
        console.error(`❌ Error in trigger test:`, error);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    process.exit(0);
};

// Wait for system
setTimeout(testPlanTrigger, 1000);
