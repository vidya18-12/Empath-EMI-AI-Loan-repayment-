import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const getStatus = async () => {
    try {
        const messages = await client.messages.list({ limit: 5 });
        console.log(`Checking ${messages.length} recent messages:\n`);

        messages.forEach(m => {
            console.log(`To: ${m.to}`);
            console.log(`Status: ${m.status}`);
            console.log(`Error Code: ${m.errorCode}`);
            console.log(`Error Message: ${m.errorMessage}`);
            console.log(`Body Snippet: ${m.body.substring(0, 30)}...`);
            console.log('---');
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
};

getStatus();
