import behavioralScoring from './services/behavioralScoring.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/**
 * Test ML model integration in Behavioral Analysis
 */
const testMLIntegration = async () => {
    console.log('\n🧪 Testing ML Behavioral Analysis Integration...');
    console.log('═══════════════════════════════════════════════════════\n');

    const testMessages = [
        "I lost my job and cannot pay this month. Please help.",
        "Need some more time to pay, checking my bank account tomorrow.",
        "I will pay the full amount tonight. Thanks for the reminder."
    ];

    const mockBorrower = {
        customerName: "Test User",
        loanAmount: 100000,
        emiAmount: 5000,
        outstandingBalance: 75000,
        daysPastDue: 45,
        isOverdue: true
    };

    for (const message of testMessages) {
        console.log(`\n💬 Input Message: "${message}"`);
        try {
            const result = await behavioralScoring.calculateComprehensiveScore({
                message,
                borrower: mockBorrower,
                responseTime: 1
            });

            console.log(`✅ Stress Level: ${result.stressLevel}`);
            console.log(`📊 Composite Score: ${result.compositeScore}/100`);
            console.log(`🔍 ML Prediction: ${JSON.stringify(result.breakdown.ml)}`);
            console.log(`📝 Primary Issue: ${result.primaryIssue}`);
            console.log(`📋 Suggestion: ${result.breakdown.ml.bankAction || 'N/A'}`);

        } catch (error) {
            console.error(`❌ Error analyzing message:`, error);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    process.exit(0);
};

// Wait a bit for other processes
setTimeout(testMLIntegration, 1000);
