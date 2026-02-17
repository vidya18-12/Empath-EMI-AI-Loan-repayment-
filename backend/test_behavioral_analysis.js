import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Borrower from './models/Borrower.js';
import Message from './models/Message.js';
import aiChatService from './services/aiChatService.js';
import { analyzeRiskLevel } from './services/aiService.js';
import EMIRecommendation from './models/EMIRecommendation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const runDiagnosis = async () => {
    await connectDB();

    try {
        // 1. Setup Test Borrower
        console.log('\n--- 1. Setting up Test Borrower ---');
        let borrower = await Borrower.findOne({ email: 'behavior_test@example.com' });
        if (!borrower) {
            borrower = await Borrower.create({
                customerName: 'Behavior Test User',
                email: 'behavior_test@example.com',
                phoneNumber: '9999999999',
                loanId: 'BEHAVIOR001',
                loanAmount: 50000,
                outstandingBalance: 50000,
                dueDate: new Date(),
                isOverdue: true,
                overdueDays: 45,
                riskLevel: 'NORMAL_RISK'
            });
            console.log('Created test borrower');
        } else {
            console.log('Using existing test borrower');
        }

        // 2. Simulate High Stress Message
        console.log('\n--- 2. Simulating High Stress Message ---');
        const testMessage = "I lost my job last week and I have a medical emergency in the family. I cannot pay anything right now.";
        console.log(`Borrower says: "${testMessage}"`);

        const analysis = aiChatService.analyzeResponse(testMessage);
        console.log('AI Analysis Result:', JSON.stringify(analysis, null, 2));

        if (analysis.stressLevel !== 'High' || analysis.primaryIssue !== 'Job Loss') {
            console.error('❌ AI Analysis Failed: Expected High Stress and Job Loss');
        } else {
            console.log('✅ AI Analysis Correct');
        }

        // 3. Verify Risk Level Update Logic
        console.log('\n--- 3. Verifying Risk Level Update Logic ---');
        const sentimentData = {
            sentiment: analysis.stressLevel,
            score: analysis.stressLevel === 'High' ? 85 : 25
        };
        const newRisk = await analyzeRiskLevel(testMessage, sentimentData);
        console.log(`Calculated Risk Level: ${newRisk}`);

        if (newRisk === 'HIGH_RISK' || newRisk === 'CRITICAL_RISK') {
            console.log('✅ Risk Level Calculation Correct');
        } else {
            console.error(`❌ Risk Level Calculation Failed: Got ${newRisk}`);
        }

        // 4. Verify EMI Plan Generation
        console.log('\n--- 4. Verifying EMI Plan Generation ---');
        const { planA, planB } = aiChatService.generateEMIPlans(borrower, analysis.stressLevel);
        console.log('Generated Plan A:', JSON.stringify(planA, null, 2));
        console.log('Generated Plan B:', JSON.stringify(planB, null, 2));

        if (planB.extendedTenure >= 12 && planB.suggestedEMI < planA.suggestedEMI) {
            console.log('✅ EMI Plans generated correctly with stress adjustments');
        } else {
            console.error('❌ EMI Plans seem incorrect (Plan B should be more lenient)');
        }

        // 5. Cleanup
        console.log('\n--- 5. Cleanup ---');
        await Borrower.deleteOne({ _id: borrower._id });
        console.log('Test borrower deleted');

    } catch (error) {
        console.error('Diagnosis failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

runDiagnosis();
