import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

console.log('--- Environment Check ---');
console.log('ENABLE_SMS:', process.env.ENABLE_SMS);
console.log('ENABLE_SMS type:', typeof process.env.ENABLE_SMS);
console.log('ENABLE_SMS === "true":', process.env.ENABLE_SMS === 'true');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'PRESENT' : 'MISSING');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'PRESENT' : 'MISSING');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? 'PRESENT' : 'MISSING');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const enableSMS = process.env.ENABLE_SMS === 'true';

if (enableSMS && accountSid && authToken && fromPhone) {
    console.log('Result: System should be in REAL mode');
} else if (!enableSMS) {
    console.log('Result: System is in DEMO mode (ENABLE_SMS is not "true")');
} else {
    console.log('Result: System is in DEMO mode (Credentials missing)');
}
