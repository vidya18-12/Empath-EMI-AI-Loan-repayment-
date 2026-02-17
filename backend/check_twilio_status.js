import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sids = [
    'SM0802c5ff4ed4680d55942ace91a1e49f',
    'SMf4f4a' // This SID looks truncated in the previous output, I'll try to get more
];

const checkSids = async () => {
    try {
        console.log('--- Twilio Message Status Check ---');

        // Let's also fetch the last 5 messages sent from this account
        const messages = await client.messages.list({ limit: 5 });

        console.log(`\nLast ${messages.length} messages in account:`);
        messages.forEach(m => {
            console.log(`- SID: ${m.sid}`);
            console.log(`  To: ${m.to}`);
            console.log(`  Status: ${m.status}`);
            console.log(`  Error Code: ${m.errorCode || 'None'}`);
            console.log(`  Error Message: ${m.errorMessage || 'None'}`);
            console.log(`  Date Sent: ${m.dateSent}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error fetching Twilio status:', error.message);
    }
};

checkSids();
