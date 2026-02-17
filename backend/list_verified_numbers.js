import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const listVerifiedNumbers = async () => {
    try {
        console.log('--- Twilio Verified Numbers ---');
        const callerIds = await client.outgoingCallerIds.list();
        callerIds.forEach(c => {
            console.log(`Phone Number: ${c.phoneNumber}, Friendly Name: ${c.friendlyName}`);
        });
        if (callerIds.length === 0) {
            console.log('No verified numbers found.');
        }
    } catch (error) {
        console.error('Error fetching verified numbers:', error.message);
    }
};

listVerifiedNumbers();
