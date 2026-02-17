import fs from 'fs';
import path from 'path';

const forceCleanEnv = () => {
    const envPath = path.resolve('.env');
    const content = [
        'PORT=5000',
        'NODE_ENV=development',
        'MONGODB_URI=mongodb://localhost:27017/loan-recovery',
        'JWT_SECRET=your-super-secret-jwt-key',
        'JWT_EXPIRE=7d',
        'MAX_FILE_SIZE=10485760',
        'MAX_RETRY_ATTEMPTS=2',
        'CALL_SIMULATION_DELAY=3000',
        'ENABLE_SCHEDULER=true',
        '# --- TWILIO ---',
        'TWILIO_ACCOUNT_SID=PASTE_SID_HERE',
        'TWILIO_AUTH_TOKEN=PASTE_TOKEN_HERE',
        'TWILIO_PHONE_NUMBER=PASTE_PHONE_HERE',
        'ENABLE_SMS=true'
    ].join('\n');

    try {
        fs.writeFileSync(envPath, content, { encoding: 'utf8', flag: 'w' });
        console.log('✅ .env file has been REWRITTEN and CLEANED.');
        console.log('Please open it and paste your real keys now.');
    } catch (err) {
        console.error('❌ Failed to write .env:', err);
    }
};

forceCleanEnv();
