import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const verifyAccountConfig = async () => {
    let report = '--- Twilio Account Diagnostic ---\n\n';

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // 1. Check Account Details
        console.log('Fetching account details...');
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        report += `Account Name: ${account.friendlyName}\n`;
        report += `Account Status: ${account.status}\n`;
        report += `Account Type: ${account.type}\n`; // Check if Trial or Full
        report += `Current Balance: ${account.balance ? account.balance : 'Unknown'}\n\n`;

        // 2. Fetch ALL Verified Caller IDs
        console.log('Fetching verified numbers...');
        const callerIds = await client.outgoingCallerIds.list({ limit: 20 });

        report += `--- List of Verified Numbers (${callerIds.length}) ---\n`;
        if (callerIds.length === 0) {
            report += '❌ NO verified numbers found in this account.\n';
            report += '   This explains why messages are failing.\n';
        } else {
            callerIds.forEach(id => {
                report += `✅ ${id.phoneNumber} [${id.friendlyName || 'No Name'}]\n`;
            });
        }
        report += '\n';

        // 3. Compare with our targets
        const targets = ['+918431772908', '+919019852093', '+917676940379'];
        report += '--- Verification Check ---\n';

        targets.forEach(target => {
            const isVerified = callerIds.some(c => c.phoneNumber === target);
            if (isVerified) {
                report += `[MATCH] ${target} is verified!\n`;
            } else {
                report += `[FAIL]  ${target} is NOT in the verified list for this account.\n`;
            }
        });

    } catch (error) {
        report += `❌ API Error: ${error.message}\n`;
        if (error.code) report += `   Code: ${error.code}\n`;
    }

    console.log(report);
    fs.writeFileSync('account_diagnostic.txt', report);
};

verifyAccountConfig();
