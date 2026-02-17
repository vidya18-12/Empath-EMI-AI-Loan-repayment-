import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const testTwilio = async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const enableSMS = process.env.ENABLE_SMS === 'true';

    console.log('--- Twilio Test ---');
    console.log('ENABLE_SMS:', enableSMS);
    console.log('SID:', accountSid ? accountSid.substring(0, 5) + '...' : 'MISSING');
    console.log('Phone:', fromPhone || 'MISSING');

    if (!accountSid || !authToken || !fromPhone) {
        console.log('❌ Error: Missing credentials in .env');
        process.exit(1);
    }

    try {
        const client = twilio(accountSid, authToken);
        // Try to fetch account info to verify credentials
        const account = await client.api.v2010.accounts(accountSid).fetch();
        console.log('✅ Twilio Connection Successful!');
        console.log('Account Name:', account.friendlyName);
        console.log('Account Status:', account.status);
    } catch (error) {
        console.log('❌ Twilio Connection Failed:', error.message);
        if (error.code === 20003) {
            console.log('Tip: Check if your AUTH TOKEN is correct.');
        }
    }
    process.exit(0);
};

testTwilio();
