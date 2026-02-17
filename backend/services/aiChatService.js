import { generateEMISuggestion } from './aiService.js';

// AI Chat Service for automated borrower engagement
class AIChatService {
    // Generate initial polite outreach message
    generateInitialMessage(borrower) {
        const { customerName, overdueDays, emiAmount } = borrower;

        const templates = [
            `Hello ${customerName}, we noticed your EMI payment is overdue by ${overdueDays} days. We hope everything is okay. If you're facing any difficulties, we're here to help. Could you please let us know if there's anything we can do to assist you?`,

            `Dear ${customerName}, your EMI payment of ₹${emiAmount?.toLocaleString() || 'N/A'} is ${overdueDays} days overdue. We understand that sometimes circumstances can be challenging. Please let us know if you're experiencing any difficulties, and we'll work together to find a solution.`,

            `Hi ${customerName}, we wanted to reach out regarding your EMI payment which is ${overdueDays} days past due. Is everything alright? We're committed to helping our customers through difficult times. Please share any concerns you may have.`
        ];

        // Select template based on overdue severity
        let templateIndex = 0;
        if (overdueDays > 60) templateIndex = 1;
        else if (overdueDays > 30) templateIndex = 2;

        return templates[templateIndex];
    }

    // Analyze borrower response sentiment and extract key issues
    analyzeResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Detect financial hardship keywords
        const jobIssues = ['job loss', 'lost my job', 'loss my job', 'unemployed', 'salary cut', 'layoff', 'fired', 'business loss', 'no job'];
        const medicalIssues = ['medical emergency', 'medical issue', 'hospital', 'emergency', 'surgery', 'accident', 'sick', 'family health', 'medical bill'];
        const pressureIssues = ['pressure', 'stressed', 'reminders', 'threatened', 'scared', 'mental'];
        const willingnessKeywords = ['want to pay', 'will pay', "i'll pay", 'i will pay', 'plan to pay', 'trying to', 'working on it', 'send link', 'how to pay', 'payment by', 'pay by'];
        const temporaryIssues = ['temporary', 'this month', 'next month', 'soon', 'waiting for', 'delayed salary', 'next week', 'this week', 'salary', 'salary delay', 'waiting for my salary'];
        const transportIssues = ['transport', 'vehicle', 'bike', 'car', 'accident', 'breakdown', 'fuel'];
        const familyIssues = ['family', 'marriage', 'divorce', 'death', 'relative'];
        const cashFlowIssues = ['short of money', 'cash flow', 'shortage', 'delayed payment', 'pending payment', 'client payment'];

        const hasJobIssue = jobIssues.some(k => lowerMessage.includes(k));
        const hasMedicalIssue = medicalIssues.some(k => lowerMessage.includes(k));
        const hasPressure = pressureIssues.some(k => lowerMessage.includes(k));
        const hasRefusal = refusalKeywords.some(k => lowerMessage.includes(k));
        const showsWillingness = willingnessKeywords.some(k => lowerMessage.includes(k));
        const isTemporary = temporaryIssues.some(k => lowerMessage.includes(k));
        const hasTransportIssue = transportIssues.some(k => lowerMessage.includes(k));
        const hasFamilyIssue = familyIssues.some(k => lowerMessage.includes(k));
        const hasCashFlowIssue = cashFlowIssues.some(k => lowerMessage.includes(k));

        // Determine primary issue with priority order
        let primaryIssue = 'General Financial Difficulty';
        if (hasJobIssue) primaryIssue = 'Job Loss';
        else if (hasMedicalIssue) primaryIssue = 'Medical Emergency';
        else if (hasTransportIssue) primaryIssue = 'Transport Issue';
        else if (hasFamilyIssue) primaryIssue = 'Family Emergency';
        else if (hasCashFlowIssue) primaryIssue = 'Cash Flow Problem';
        else if (hasPressure) primaryIssue = 'Harassment/Pressure';
        else if (hasRefusal) primaryIssue = 'Financial Crisis';
        else if (isTemporary) primaryIssue = 'Temporary Setback';

        const analysis = {
            primaryIssue,
            stressLevel: (hasRefusal || hasJobIssue || hasMedicalIssue) ? 'High' : hasPressure ? 'Moderate' : 'Low',
            willingnessToPay: showsWillingness ? 'Will Pay' : (isTemporary ? 'Likely to Pay' : (hasRefusal ? 'Refusal' : 'Struggling')),
            hasFinancialHardship: hasJobIssue || hasMedicalIssue || hasRefusal,
            isTemporary,
            showsWillingness,
            sentiment: 'neutral',
            suggestedPlanType: 'standard'
        };

        // Determine sentiment
        if (analysis.showsWillingness) {
            analysis.sentiment = 'positive';
        } else if (analysis.hasFinancialHardship || hasPressure) {
            analysis.sentiment = 'stressed';
        }

        // Suggest plan type based on analysis
        if (analysis.stressLevel === 'High') {
            analysis.suggestedPlanType = 'extended'; // Maximum relief
        } else if (analysis.isTemporary || analysis.stressLevel === 'Moderate') {
            analysis.suggestedPlanType = 'short-term'; // Moderate relief
        }

        return analysis;
    }

    // Detect if the borrower is explicitly asking for repayment plans
    detectPlanRequest(message) {
        const lowerMessage = message.toLowerCase();
        const planKeywords = [
            'show me the plans', 'send plans', 'send the plans', 'what are the plans',
            'what plans', 'repayment plans', 'repayment options', 'emi plans', 'show plans', 'again',
            'repeat plans', 'share plans', 'send me plans', 'get the plans', 'available plans',
            'what options', 'what are my options', 'any options', 'help me with plans'
        ];

        const hasPlans = lowerMessage.includes('plan');
        const hasRequestAction = ['get', 'show', 'send', 'view', 'what', 'once', 'again', 'repeat'].some(a => lowerMessage.includes(a));

        return planKeywords.some(k => lowerMessage.includes(k)) || (hasPlans && hasRequestAction);
    }

    // Generate empathetic response with EMI plans
    generateResponseWithPlans(borrower, analysis, planA, planB) {
        const { customerName } = borrower;

        let empathyMessage = '';

        if (analysis.stressLevel === 'High') {
            empathyMessage = `I'm truly sorry to hear about the ${analysis.primaryIssue.toLowerCase()} you're facing, ${customerName}. We understand how difficult this is. `;
        } else if (analysis.stressLevel === 'Moderate') {
            empathyMessage = `I'm sorry to hear that you're dealing with ${analysis.primaryIssue.toLowerCase()}, ${customerName}. Thank you for being honest with us. `;
        } else if (analysis.showsWillingness) {
            empathyMessage = `It's great to hear your commitment to resolving this, ${customerName}. `;
        } else {
            empathyMessage = `I'm sorry to hear about the difficulties you're facing, ${customerName}. `;
        }

        const planMessage = `
${empathyMessage}Our priority is to support you through this. I've formulated two customized payment options to help ease your burden:

📋 **Plan A - Balanced Support**
• Monthly EMI: ₹${planA.suggestedEMI.toLocaleString()}
• Extended Tenure: ${planA.extendedTenure} months
• Grace Period: ${planA.gracePeriod} days
${planA.interestWaiver ? `• Interest Waiver: ${planA.interestWaiver}%` : ''}

📋 **Plan B - Comprehensive Relief**
• Monthly EMI: ₹${planB.suggestedEMI.toLocaleString()}
• Extended Tenure: ${planB.extendedTenure} months
• Grace Period: ${planB.gracePeriod} days
${planB.interestWaiver ? `• Interest Waiver: ${planB.interestWaiver}%` : ''}

Both options are designed to significantly reduce your monthly commitment. Do either of these help your current situation?`;

        return planMessage;
    }

    // Generate EMI Plan A and B
    generateEMIPlans(borrower, stressLevel = 'Low') {
        const { loanAmount, outstandingBalance, emiAmount, overdueDays } = borrower;

        const balance = outstandingBalance || loanAmount;
        const currentEMI = emiAmount || (loanAmount * 0.05);

        // Adjust relief factors based on stress level
        const reliefFactor = stressLevel === 'High' ? 0.45 : (stressLevel === 'Moderate' ? 0.65 : 0.80);
        const tenureFactor = stressLevel === 'High' ? 12 : (stressLevel === 'Moderate' ? 8 : 4);
        const graceFactor = stressLevel === 'High' ? 30 : (stressLevel === 'Moderate' ? 15 : 7);

        // Plan A: Moderate/Balanced
        const planA = {
            suggestedEMI: Math.round(currentEMI * reliefFactor * 1.2), // Slightly higher than base relief
            extendedTenure: tenureFactor,
            gracePeriod: graceFactor,
            interestWaiver: overdueDays > 45 ? 2 : 0,
            totalAmount: balance,
            description: 'Balanced relief plan'
        };

        // Plan B: Maximum Relief
        const planB = {
            suggestedEMI: Math.round(currentEMI * reliefFactor), // Full relief
            extendedTenure: tenureFactor + 6, // Even more time
            gracePeriod: graceFactor + 10, // Full grace
            interestWaiver: overdueDays > 45 ? 5 : 2,
            totalAmount: balance,
            description: 'Maximum relief plan'
        };

        return { planA, planB };
    }

    // Generate follow-up message if no response
    generateFollowUpMessage(borrower, daysSinceLastMessage) {
        const { customerName } = borrower;

        if (daysSinceLastMessage <= 3) {
            return `Hi ${customerName}, I wanted to follow up on my previous message. We're here to help you with your payment situation. Please let us know if you have any questions or concerns.`;
        } else if (daysSinceLastMessage <= 7) {
            return `Dear ${customerName}, we haven't heard from you yet. We genuinely want to help you resolve your overdue payment. Our team is ready to work with you on a solution. Please reach out at your earliest convenience.`;
        } else {
            return `Hello ${customerName}, this is a final reminder about your overdue payment. We've been trying to reach you to discuss flexible payment options. Please contact us as soon as possible to avoid further action.`;
        }
    }
}

export default new AIChatService();
