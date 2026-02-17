import fs from 'fs';

try {
    const data = fs.readFileSync('twilio_full_status.txt', 'utf8');
    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.includes('To:') || line.includes('Status:') || line.includes('Error Code:')) {
            console.log(line.trim());
        }
    });
} catch (err) {
    console.error('Error reading file:', err);
}
