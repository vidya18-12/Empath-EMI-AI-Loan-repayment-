import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const checkAllNumbers = async () => {
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const numbers = [
            { name: 'Kavitha', phone: '+918431772908' },
            { name: 'anu', phone: '+919019852093' },
            { name: 'vidya', phone: '+917676940379' }
        ];

        console.log('Checking delivery status for all verified numbers...\n');
        console.log('='.repeat(60));

        for (const contact of numbers) {
            console.log(`\n${contact.name} (${contact.phone}):`);

            const messages = await client.messages.list({
                to: contact.phone,
                limit: 1
            });

            if (messages.length === 0) {
                console.log('  ❌ No messages found');
            } else {
                const msg = messages[0];
                const statusIcon = msg.status === 'delivered' ? '✅' :
                    msg.status === 'failed' ? '❌' :
                        msg.status === 'undelivered' ? '❌' : '⏳';
                console.log(`  ${statusIcon} Status: ${msg.status.toUpperCase()}`);
                console.log(`  Sent: ${msg.dateCreated}`);
                if (msg.errorCode) {
                    console.log(`  Error: ${msg.errorCode} - ${msg.errorMessage}`);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ All checks complete!');

    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkAllNumbers();
