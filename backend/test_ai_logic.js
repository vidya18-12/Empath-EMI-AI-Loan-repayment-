import { analyzeSentiment, generateAIReply } from './services/aiService.js';
import aiChatService from './services/aiChatService.js';

const testMessage = "i loss my job";
const borrowerName = "Sneha Reddy";

console.log("Testing message:", testMessage);

// Test 1: aiService.analyzeSentiment
const sentimentData = analyzeSentiment(testMessage);
console.log("Sentiment Analysis Result:", JSON.stringify(sentimentData, null, 2));

// Test 2: aiService.generateAIReply
const aiReply = generateAIReply(borrowerName, sentimentData.sentiment, testMessage);
console.log("AI Service Reply:\n", aiReply);

// Test 3: aiChatService.analyzeResponse
const granularAnalysis = aiChatService.analyzeResponse(testMessage);
console.log("Granular Analysis Result:", JSON.stringify(granularAnalysis, null, 2));

// Test 4: aiChatService.generateResponseWithPlans
const plans = aiChatService.generateEMIPlans({ loanAmount: 100000, emiAmount: 5000 }, granularAnalysis.stressLevel);
const planReply = aiChatService.generateResponseWithPlans(
    { customerName: borrowerName },
    granularAnalysis,
    plans.planA,
    plans.planB
);
console.log("Plan Response:\n", planReply);
