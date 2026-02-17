import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const checkRecentLogs = async () => {
    let report = '--- Recent Twilio Message Logs ---\n\n';
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        console.log('Fetching last 10 messages...');
        const messages = await client.messages.list({ limit: 10 });

        messages.forEach(m => {
            report += `To: ${m.to}\n`;
            report += `From: ${m.from}\n`;
            report += `Status: ${m.status.toUpperCase()}\n`;
            report += `SID: ${m.sid}\n`;
            report += `Date: ${m.dateCreated}\n`;
            if (m.errorCode) {
                report += `❌ ERROR: ${m.errorCode} - ${m.errorMessage}\n`;
            }
            report += `Body: ${m.body.substring(0, 50)}...\n`;
            report += '-'.repeat(30) + '\n';
        });

    } catch (error) {
        report += `Error fetching logs: ${error.message}\n`;
    }

    console.log(report);
    fs.writeFileSync('recent_logs.txt', report);
};

checkRecentLogs();
