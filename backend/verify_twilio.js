import twilioService from './services/twilioService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- Testing Twilio Service ---');
console.log('Mode:', process.env.ENABLE_SMS === 'true' ? 'REAL' : 'DEMO');

const testSMS = async () => {
    const testNumber = '9812345678';
    const testMessage = 'This is a test message from the AI Loan Recovery dashboard.';

    console.log(`Sending test SMS to: ${testNumber}`);
    const result = await twilioService.sendSMS(testNumber, testMessage);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
        console.log('\n✅ Twilio test successful!');
    } else {
        console.log('\n❌ Twilio test failed:', result.error);
    }
};

testSMS();
