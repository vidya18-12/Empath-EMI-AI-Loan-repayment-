import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const checkMessageStatus = async () => {
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        console.log('Fetching recent messages...\n');

        // Get the last 5 messages sent to the user's number
        const messages = await client.messages.list({
            to: '+918431772908',
            limit: 5
        });

        if (messages.length === 0) {
            console.log('No messages found to this number.');
            return;
        }

        console.log(`Found ${messages.length} message(s):\n`);

        messages.forEach((msg, i) => {
            console.log(`--- Message ${i + 1} ---`);
            console.log('SID:', msg.sid);
            console.log('Status:', msg.status);
            console.log('Error Code:', msg.errorCode || 'None');
            console.log('Error Message:', msg.errorMessage || 'None');
            console.log('Date Sent:', msg.dateSent);
            console.log('Direction:', msg.direction);
            console.log('Price:', msg.price, msg.priceUnit);
            console.log('Body:', msg.body.substring(0, 50) + '...');
            console.log('');
        });

        const latest = messages[0];
        console.log('='.repeat(50));
        console.log('LATEST MESSAGE STATUS:', latest.status);
        console.log('='.repeat(50));

        if (latest.status === 'delivered') {
            console.log('✅ Message was DELIVERED successfully!');
            console.log('If you did not receive it, check:');
            console.log('1. Phone signal strength');
            console.log('2. SMS inbox / spam folder');
            console.log('3. Phone number is correct');
        } else if (latest.status === 'failed') {
            console.log('❌ Message FAILED');
            console.log('Error:', latest.errorCode, '-', latest.errorMessage);
        } else if (latest.status === 'undelivered') {
            console.log('❌ Message was UNDELIVERED');
            console.log('Error:', latest.errorCode, '-', latest.errorMessage);
        } else {
            console.log(`⏳ Message is still: ${latest.status}`);
            console.log('Wait a few more seconds and check again.');
        }

    } catch (error) {
        console.error('Error fetching messages:', error.message);
    }
};

checkMessageStatus();
