import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const checkAllNumbers = async () => {
    let report = '--- Detailed Delivery Report ---\n\n';

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const numbers = [
            { name: 'Kavitha', phone: '+918431772908' },
            { name: 'anu', phone: '+919019852093' },
            { name: 'vidya', phone: '+917676940379' }
        ];

        for (const contact of numbers) {
            report += `Checking ${contact.name} (${contact.phone})...\n`;

            try {
                const messages = await client.messages.list({
                    to: contact.phone,
                    limit: 1
                });

                if (messages.length === 0) {
                    report += `  ❌ No messages ever sent to this number.\n`;
                } else {
                    const msg = messages[0];
                    report += `  SID: ${msg.sid}\n`;
                    report += `  Status: ${msg.status.toUpperCase()}\n`;

                    if (msg.status === 'failed' || msg.status === 'undelivered') {
                        report += `  ❌ FAILURE CODE: ${msg.errorCode}\n`;
                        report += `  ❌ REASON: ${msg.errorMessage}\n`;

                        // Check for common trial errors
                        if (msg.errorCode === 21608) {
                            report += '  ⚠️  Specifically: "The number is unverified" (Twilio Trial Restriction)\n';
                        }
                    } else if (msg.status === 'delivered') {
                        report += `  ✅ DELIVERED\n`;
                    } else if (msg.status === 'queued' || msg.status === 'sent') {
                        report += `  ⏳ STILL SENDING\n`;
                    }
                }
            } catch (err) {
                report += `  API Error checking logs: ${err.message}\n`;
            }
            report += '-'.repeat(40) + '\n';
        }

    } catch (error) {
        report += `System Error: ${error.message}\n`;
    }

    fs.writeFileSync('delivery_report.txt', report);
    console.log('Report generated in delivery_report.txt');
};

checkAllNumbers();
