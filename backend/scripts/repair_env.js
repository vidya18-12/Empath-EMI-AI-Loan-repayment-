import fs from 'fs';

const repairEnv = () => {
    try {
        const content = fs.readFileSync('.env', 'utf8');
        console.log('Original content length:', content.length);

        // Find common patterns
        const sidMatch = content.match(/AC[a-f0-9]{32}/i);
        const tokenMatch = content.match(/[a-f0-9]{32}/i); // Simple hex check for token
        const phoneMatch = content.match(/\+\d{10,15}/);

        const sid = sidMatch ? sidMatch[0] : '';
        const token = tokenMatch ? (tokenMatch[0] === sid ? null : tokenMatch[0]) : null;

        // If sid and token matched the same (because they are both hex-ish), try again for token
        let actualToken = token;
        if (!actualToken) {
            const allHex = content.match(/[a-f0-9]{32}/gi);
            if (allHex && allHex.length > 1) {
                actualToken = allHex.find(h => h.toLowerCase() !== sid.toLowerCase());
            }
        }

        const phone = phoneMatch ? phoneMatch[0] : '';

        console.log('Detected SID:', sid);
        console.log('Detected Token:', actualToken ? 'SENSITIVE (FOUND)' : 'NOT FOUND');
        console.log('Detected Phone:', phone);

        const cleanLines = [
            '# Server Configuration',
            'PORT=5000',
            'NODE_ENV=development',
            '',
            '# Database',
            'MONGODB_URI=mongodb://localhost:27017/loan-recovery',
            '',
            '# JWT Authentication',
            'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production',
            'JWT_EXPIRE=7d',
            '',
            '# File Upload',
            'MAX_FILE_SIZE=10485760',
            '',
            '# AI Agent Configuration',
            'MAX_RETRY_ATTEMPTS=2',
            'CALL_SIMULATION_DELAY=3000',
            '',
            '# Scheduler',
            'ENABLE_SCHEDULER=true',
            '',
            '# Twilio Configuration',
            `TWILIO_ACCOUNT_SID=${sid}`,
            `TWILIO_AUTH_TOKEN=${actualToken || ''}`,
            `TWILIO_PHONE_NUMBER=${phone}`,
            'ENABLE_SMS=true'
        ];

        fs.writeFileSync('.env', cleanLines.join('\n'));
        console.log('✅ .env file repaired and cleaned!');
    } catch (error) {
        console.error('❌ Repair failed:', error);
    }
};

repairEnv();
