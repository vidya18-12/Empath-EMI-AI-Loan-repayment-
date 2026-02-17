import dotenv from 'dotenv';

dotenv.config();

/**
 * Send SMS (MOCK IMPLEMENTATION)
 * Replaces actual Twilio functionality to allow system to run without external dependencies.
 * @param {string} to - Borrower's phone number
 * @param {string} body - Message content
 */
export const sendSMS = async (to, body) => {
    try {
        const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/[^0-9]/g, '')}`;

        console.log(`\n--- [MOCK SMS LOG] ---`);
        console.log(`To: ${formattedTo}`);
        console.log(`Body: ${body}`);
        console.log(`[System]: Sms functionality is disabled/mocked as per request.`);
        console.log(`---------------------------\n`);

        return { success: true, mock: true, sid: `mock-${Date.now()}`, formattedTo };
    } catch (error) {
        console.error(`[MOCK SMS ERROR] ${error.message}`);
        return { success: false, error: error.message };
    }
};

export default { sendSMS };
