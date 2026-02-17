import { analyzeWithModel } from './services/nlpAnalyzer.js';

const runTest = async () => {
    console.log("Testing Model Integration...");

    const transcripts = [
        "I will pay the full amount tomorrow by 5pm",
        "I lost my job and cannot pay right now. Please give me some time.",
        "Stop calling me, I don't know what this is about."
    ];

    for (const text of transcripts) {
        console.log(`\nAnalyzing: "${text}"`);
        const start = Date.now();
        const result = await analyzeWithModel(text);
        const duration = Date.now() - start;

        if (result) {
            console.log("Result:", JSON.stringify(result, null, 2));
        } else {
            console.log("Result: Failed to get prediction");
        }
        console.log(`Time taken: ${duration}ms`);
    }
};

runTest();
