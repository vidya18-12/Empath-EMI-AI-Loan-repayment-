import twilio from 'twilio';
import dotenv from 'dotenv';
import twilioService from '../services/twilioService.js';
import fs from 'fs';

dotenv.config();

const compareMethods = async () => {
    let report = '--- Comparison Report ---\n\n';
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const target = '+918431772908'; // Kavitha

        // Test 1: Raw Client with SAFE content
        report += '1. Sending SAFE content via Raw Client...\n';
        try {
            const msg1 = await client.messages.create({
                body: 'Test 1: Safe Content ' + Date.now(),
                from: process.env.TWILIO_PHONE_NUMBER,
                to: target
            });
            report += `   Queued: ${msg1.sid}\n`;
        } catch (e) {
            report += `   Error: ${e.message}\n`;
        }

        // Test 2: Raw Client with AI-like content
        report += '\n2. Sending RISKY (AI) content via Raw Client...\n';
        const riskyContent = 'Hello Kavitha, we noticed your EMI payment is overdue. Please pay immediately.';
        try {
            const msg2 = await client.messages.create({
                body: riskyContent,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: target
            });
            report += `   Queued: ${msg2.sid}\n`;
        } catch (e) {
            report += `   Error: ${e.message}\n`;
        }

        // Test 3: Service Method
        report += '\n3. Sending via twilioService.js...\n';
        const res3 = await twilioService.sendSMS(target, 'Test 3: Service Method ' + Date.now());
        if (res3.success) report += `   Queued: ${res3.sid}\n`;
        else report += `   Error: ${res3.error}\n`;

        console.log('Waiting 15 seconds for delivery updates...');
        await new Promise(r => setTimeout(r, 15000));

        report += '\n--- Checking Final Status ---\n';
        const messages = await client.messages.list({ limit: 3, to: target });

        messages.forEach(m => {
            report += `SID: ${m.sid}\n`;
            report += `Body: ${m.body.substring(0, 30)}...\n`;
            report += `Status: ${m.status.toUpperCase()}\n`;
            if (m.errorCode) report += `Error: ${m.errorCode}\n`;
            report += '\n';
        });

    } catch (err) {
        report += `\nCRITICAL SCRIPT ERROR: ${err.message}`;
    }

    fs.writeFileSync('comparison_report.txt', report);
    console.log('Report written to comparison_report.txt');
};

compareMethods();
