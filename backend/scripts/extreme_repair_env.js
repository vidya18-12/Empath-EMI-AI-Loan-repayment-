import fs from 'fs';

const extremeRepair = () => {
    try {
        const content = fs.readFileSync('.env', 'utf8');
        console.log('--- Corrupted Content Analysis ---');

        // Extract SID (AC + 32 hex)
        const sidMatch = content.match(/AC[a-f0-9]{32}/i);
        // Extract Token (32 hex characters, not starting with AC)
        const allHex32 = content.match(/[a-f0-9]{32}/gi) || [];
        const sid = sidMatch ? sidMatch[0] : '';
        const token = allHex32.find(h => h.toLowerCase() !== sid.toLowerCase().replace('ac', '')) || '';

        // Extract Phone (US or India format)
        const phones = content.match(/\+?[1-9]\d{9,14}/g) || [];
        const twilioPhone = phones.find(p => p.includes('1857') || p.length > 10) || '';

        console.log('Extracted SID:', sid);
        console.log('Extracted Token:', token ? 'FOUND (SENSITIVE)' : 'NOT FOUND');
        console.log('Extracted Twilio Phone:', twilioPhone);

        if (!sid || !token || !twilioPhone) {
            console.log('⚠️ Could not extract all values. Entering manual repair mode.');
        }

        const cleanLines = [
            'PORT=5000',
            'NODE_ENV=development',
            'MONGODB_URI=mongodb://localhost:27017/loan-recovery',
            'JWT_SECRET=your-super-secret-jwt-key',
            'JWT_EXPIRE=7d',
            'MAX_FILE_SIZE=10485760',
            'MAX_RETRY_ATTEMPTS=2',
            'CALL_SIMULATION_DELAY=3000',
            'ENABLE_SCHEDULER=true',
            '',
            '# Twilio Configuration',
            `TWILIO_ACCOUNT_SID=${sid}`,
            `TWILIO_AUTH_TOKEN=${token}`,
            `TWILIO_PHONE_NUMBER=${twilioPhone.startsWith('+') ? twilioPhone : '+' + twilioPhone}`,
            'ENABLE_SMS=true'
        ];

        fs.writeFileSync('.env', cleanLines.join('\n'));
        console.log('✅ .env file has been EXTREMELY REPAIRED and CLEANED.');
    } catch (err) {
        console.error('❌ Repair failed:', err);
    }
};

extremeRepair();
