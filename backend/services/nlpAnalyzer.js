// natural import removed
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Unused functions removed (analyzeTranscript, calculateRiskScore, classifyBehavior, generateSummary)

/**
 * Analyze transcript using Python ML models
 * @returns {Promise<Object>} Analysis result { risk_severity, bank_action, ... }
 */
export const analyzeWithModel = (transcript) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../predict_risk.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorString}`);
                // Fallback to heuristic analysis if model fails
                resolve(null);
                return;
            }

            try {
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                console.error('Error parsing Python output:', error);
                resolve(null);
            }
        });

        // Send transcript to Python script
        const payload = JSON.stringify({ text: transcript });
        pythonProcess.stdin.write(payload);
        pythonProcess.stdin.end();
    });
};
