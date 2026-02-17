const HIGH_STRESS_KEYWORDS = ['lost my job', 'loss my job', 'no job', 'medical emergency', 'medical issue', 'hospital', "can't pay", 'cant pay', 'cannot pay', 'unable to pay', 'no money', 'pressure', 'struggling', 'crisis', 'layoff', 'fired', 'surgery', 'accident'];
const MODERATE_STRESS_KEYWORDS = ['delay', 'need time', 'difficulty', 'hardship', 'trouble', 'late', 'financial issue', 'salary delay', 'business slow', 'this week', 'next week'];
const LOW_STRESS_KEYWORDS = ['remind me', 'later', 'busy', 'soon', 'tomorrow', 'paying'];

import { analyzeWithModel } from './nlpAnalyzer.js';

/**
 * Analyzes message sentiment based on keywords
 * @param {string} text 
 * @returns {object} { sentiment: 'Low'|'Moderate'|'High'|'Unknown', score: number }
 */
export const analyzeSentiment = (text) => {
    const lowercaseText = text.toLowerCase();

    // Check High Stress
    if (HIGH_STRESS_KEYWORDS.some(key => lowercaseText.includes(key))) {
        return { sentiment: 'High', score: 85 };
    }

    // Check Moderate Stress
    if (MODERATE_STRESS_KEYWORDS.some(key => lowercaseText.includes(key))) {
        return { sentiment: 'Moderate', score: 55 };
    }

    // Check Low Stress
    if (LOW_STRESS_KEYWORDS.some(key => lowercaseText.includes(key))) {
        return { sentiment: 'Low', score: 25 };
    }

    return { sentiment: 'Unknown', score: 0 };
};

/**
 * Generates EMI suggestion based on loan amount and risk level
 * @param {number} loanAmount 
 * @param {string} riskLevel 
 * @returns {object} EMI recommendation
 */
export const generateEMISuggestion = (loanAmount, riskLevel) => {
    let suggestion = {
        suggestedEMI: 0,
        extendedTenure: 0,
        gracePeriod: 0
    };

    const monthlyEMI = loanAmount / 12; // Base assumption: 12 months tenure

    switch (riskLevel) {
        case 'HIGH_RISK':
        case 'CRITICAL_RISK':
            // substantial relief for high risk
            suggestion.suggestedEMI = Math.round(monthlyEMI * 0.55); // 45% reduction
            suggestion.extendedTenure = 9; // +9 months
            suggestion.gracePeriod = 21; // 21 days grace
            break;
        case 'MODERATE_RISK':
            // offer grace period + significant reduction
            suggestion.suggestedEMI = Math.round(monthlyEMI * 0.75); // 25% reduction
            suggestion.extendedTenure = 6; // +6 months
            suggestion.gracePeriod = 14; // 14 days grace
            break;
        case 'NORMAL_RISK':
            // standard adjustments
            suggestion.suggestedEMI = Math.round(monthlyEMI * 0.90); // 10% reduction
            suggestion.extendedTenure = 3; // +3 months
            suggestion.gracePeriod = 7; // 7 days grace
            break;
        default:
            suggestion.suggestedEMI = Math.round(monthlyEMI);
            suggestion.extendedTenure = 0;
            suggestion.gracePeriod = 0;
    }

    return suggestion;
};

/**
 * Generates an even more lenient EMI suggestion for borrowers who rejected the first one
 * @param {number} loanAmount 
 * @returns {object} Highly lenient EMI recommendation
 */
export const generateLenientEMISuggestion = (loanAmount) => {
    const monthlyEMI = loanAmount / 12;
    return {
        suggestedEMI: Math.round(monthlyEMI * 0.45), // 55% reduction
        extendedTenure: 12, // +12 months
        gracePeriod: 30, // 30 days grace
        isPlanB: true
    };
};

/**
 * Generates an empathetic AI reply for the manager
 * @param {string} borrowerName 
 * @param {string} sentiment 
 * @param {string} content 
 * @returns {string} AI reply
 */
export const generateAIReply = (borrowerName, sentiment, content) => {
    const greeting = `Hello ${borrowerName},`;

    let body = "";
    const lowercaseContent = content.toLowerCase();

    // Specific reason checking
    const hasJobIssue = lowercaseContent.includes('job') || lowercaseContent.includes('work') || lowercaseContent.includes('unemployed') || lowercaseContent.includes('layoff');
    const hasMedicalIssue = lowercaseContent.includes('medical') || lowercaseContent.includes('health') || lowercaseContent.includes('hospital') || lowercaseContent.includes('emergency') || lowercaseContent.includes('family');
    const hasPressure = lowercaseContent.includes('pressure') || lowercaseContent.includes('reminders') || lowercaseContent.includes('stressed');

    if (sentiment === 'High' || hasPressure) {
        if (hasJobIssue) {
            body = "I'm deeply sorry to hear about your job loss. We truly understand the immense pressure you must be under. Please stay calm, we are here to support you, not add more stress. We've prepared a highly flexible plan with significant reductions and extra time to help you get back on your feet. Would you like to see these options?";
        } else if (hasMedicalIssue) {
            body = "I'm genuinely concerned to hear about the medical emergency in your family. Health and family come first. We can certainly adjust your repayment schedule to give you the space and peace of mind you need. I've formulated a plan with a generous grace period and lower installments to help. Shall we proceed?";
        } else if (hasPressure) {
            body = "We truly apologize if our reminders have added to your stress. Our aim is to be your partner in resolving this, not a source of pressure. We value your peace of mind and would like to offer a more relaxed repayment schedule with less frequent communication if that helps. I've designed a specialized relief plan for you—would you like to review it?";
        } else {
            body = "I'm very sorry to hear that you're going through such a challenging time. Please know that we are committed to finding a solution that works for you. Our priority is your well-being. I've developed a customized relief plan to ease your burden. Would you like to discuss the details?";
        }
    } else if (sentiment === 'Moderate') {
        body = "Thank you for sharing your situation with us. We understand that things can be difficult sometimes. To support you effectively, I've created some flexible options like grace periods and temporary EMI reductions. Would you like to explore these to see which one fits your current situation best?";
    } else if (sentiment === 'Low') {
        body = "Thank you for the update. We appreciate your transparency. We've noted your message and are glad you're staying in touch. Is there anything specific we can do to make your upcoming payment even easier for you?";
    } else {
        body = "Thank you for reaching out. We want to ensure your repayment journey is as smooth as possible. If you're encountering any obstacles, please let us know so we can offer tailored support and flexible options. How can we best assist you today?";
    }

    return `${greeting}\n\n${body}`;
};

/**
 * Automatically calculates a borrower's risk level based on AI sentiment and content analysis
 * @param {string} content - message text
 * @param {object} sentimentData - { sentiment, score }
 * @returns {Promise<string>} One of ['NORMAL_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'CRITICAL_RISK']
 */
export const analyzeRiskLevel = async (content, sentimentData) => {
    const lowercaseContent = content.toLowerCase();
    const { sentiment } = sentimentData;

    // Get ML Prediction
    let mlResult = null;
    try {
        mlResult = await analyzeWithModel(content);
        if (mlResult) {
            console.log('Chat ML Analysis:', mlResult);
        }
    } catch (err) {
        console.error('Chat ML Analysis failed:', err);
    }

    // Specific problem detection
    const hasJobIssue = lowercaseContent.includes('job') || lowercaseContent.includes('work') || lowercaseContent.includes('unemployed') || lowercaseContent.includes('layoff');
    const hasMedicalIssue = lowercaseContent.includes('medical') || lowercaseContent.includes('health') || lowercaseContent.includes('hospital') || lowercaseContent.includes('sick') || lowercaseContent.includes('emergency');
    const hasPressure = lowercaseContent.includes('pressure') || lowercaseContent.includes('stressed') || lowercaseContent.includes('reminders');
    const hasTotalRefusal = (lowercaseContent.includes("can't pay") || lowercaseContent.includes("won't pay") || lowercaseContent.includes("no money")) && !sentimentData.showsWillingness;

    // ML Overrides
    if (mlResult) {
        if (mlResult.risk_severity === 'High') return 'HIGH_RISK';
        if (mlResult.bank_action === 'LegalAction') return 'CRITICAL_RISK'; // Example mapping
    }

    // 1. CRITICAL_RISK: High stress + Refusal OR Chronic pressure
    if (hasTotalRefusal && sentiment === 'High') {
        return 'CRITICAL_RISK';
    }

    // 2. HIGH_RISK: High stress OR specific job/medical issues
    if (sentiment === 'High' || hasJobIssue || hasMedicalIssue) {
        return 'HIGH_RISK';
    }

    // 3. MODERATE_RISK: Moderate stress OR pressure issues
    if (sentiment === 'Moderate' || hasPressure) {
        return 'MODERATE_RISK';
    }

    // 4. NORMAL_RISK: Low stress or positive intent
    const willPayKeywords = ["soon", "tomorrow", "next week", "confirm", "remind", "pay later", "will pay"];
    if (sentiment === 'Low' || willPayKeywords.some(k => lowercaseContent.includes(k))) {
        return 'NORMAL_RISK';
    }

    return 'PENDING'; // Fallback if unclear
};
