import { analyzeSentiment, analyzeRiskLevel } from './aiService.js';

/**
 * Comprehensive Behavioral Scoring Algorithm
 * Combines multiple factors to accurately determine borrower stress levels
 */
class BehavioralScoring {

    /**
     * Calculate comprehensive behavioral score
     * @param {Object} params - Analysis parameters
     * @param {string} params.message - Borrower's message
     * @param {Object} params.borrower - Borrower data
     * @param {number} params.responseTime - Time taken to respond (hours)
     * @returns {Promise<Object>} Comprehensive analysis result
     */
    async calculateComprehensiveScore(params) {
        const { message = '', borrower, responseTime = 0 } = params;

        // Safety check for empty message
        if (!message || typeof message !== 'string') {
            return {
                compositeScore: 0,
                stressLevel: 'Low',
                primaryIssue: 'No message provided',
                willingnessToPay: 'Unknown',
                breakdown: {
                    message: { score: 0, primaryIssue: 'None', showsWillingness: false, hasRefusal: false },
                    communication: { score: 0 },
                    financial: { score: 0 },
                    ml: { score: 0 }
                }
            };
        }

        // 1. Message Analysis (40% weight)
        const messageScore = this.analyzeMessage(message);

        // 2. Communication Patterns (20% weight)
        const communicationScore = this.analyzeCommunicationPattern(responseTime, borrower);

        // 3. Financial Indicators (30% weight)
        const financialScore = this.analyzeFinancialIndicators(borrower);

        // 4. ML Prediction (60% weight) - Using trained .pkl models
        const mlScore = await this.getMLPrediction(message);

        // Calculate weighted composite score - Heavily skewed towards ML model output
        const compositeScore = (
            mlScore.score * 0.60 +          // ML Model Output
            messageScore.score * 0.15 +     // Keyword Analysis
            financialScore.score * 0.15 +   // Financial Status
            communicationScore.score * 0.10 // Behavior Patterns
        );

        // Determine final stress level
        const stressLevel = this.determineStressLevel(compositeScore);

        // Determine willingness to pay
        const willingnessToPay = this.determineWillingness(messageScore, financialScore);

        return {
            compositeScore: Math.round(compositeScore),
            stressLevel,
            primaryIssue: messageScore.primaryIssue,
            willingnessToPay,
            breakdown: {
                message: messageScore,
                communication: communicationScore,
                financial: financialScore,
                ml: mlScore
            }
        };
    }

    /**
     * Analyze message content (40% weight)
     */
    analyzeMessage(message) {
        if (!message || typeof message !== 'string') {
            return {
                score: 0,
                primaryIssue: 'General Financial Difficulty',
                showsWillingness: false,
                hasRefusal: false
            };
        }
        const lowerMessage = message.toLowerCase();

        // Issue detection with severity scoring
        const issues = {
            jobLoss: { keywords: ['lost job', 'no job', 'unemployed', 'layoff', 'fired'], severity: 90 },
            medical: { keywords: ['medical', 'hospital', 'emergency', 'surgery', 'sick', 'health'], severity: 85 },
            transport: { keywords: ['transport', 'vehicle', 'accident', 'breakdown'], severity: 60 },
            family: { keywords: ['family', 'death', 'marriage', 'divorce'], severity: 75 },
            cashFlow: { keywords: ['short of money', 'cash flow', 'shortage', 'delayed payment'], severity: 70 },
            pressure: { keywords: ['pressure', 'stressed', 'harassment', 'threatened'], severity: 65 },
            refusal: { keywords: ["can't pay", "won't pay", 'no money', 'cannot afford'], severity: 95 },
            temporary: { keywords: ['temporary', 'this month', 'next month', 'delayed salary', 'waiting for salary', 'salary delay'], severity: 55 }
        };

        // Find matching issues
        let maxSeverity = 30; // Default baseline
        let primaryIssue = 'General Financial Difficulty';

        for (const [issueType, data] of Object.entries(issues)) {
            if (data.keywords.some(k => lowerMessage.includes(k))) {
                if (data.severity > maxSeverity) {
                    maxSeverity = data.severity;
                    primaryIssue = this.formatIssueName(issueType);
                }
            }
        }

        // Check for willingness indicators
        const willingnessKeywords = ['want to pay', 'will pay', "i'll pay", 'i will pay', 'trying to', 'working on', 'pay by'];
        const showsWillingness = willingnessKeywords.some(k => lowerMessage.includes(k));

        // Adjust score based on willingness
        if (showsWillingness && maxSeverity > 50) {
            maxSeverity -= 15; // Reduce severity if showing willingness
        }

        return {
            score: maxSeverity,
            primaryIssue,
            showsWillingness,
            hasRefusal: lowerMessage.includes("can't pay") || lowerMessage.includes("won't pay")
        };
    }

    /**
     * Analyze communication patterns (20% weight)
     */
    analyzeCommunicationPattern(responseTime, borrower) {
        let score = 50; // Baseline

        // Response time factor
        if (responseTime) {
            if (responseTime < 2) score -= 10; // Quick response = lower stress
            else if (responseTime > 48) score += 20; // Very delayed = higher stress
            else if (responseTime > 24) score += 10; // Delayed = moderate stress
        }

        // Days past due factor
        const dpd = borrower.daysPastDue || borrower.overdueDays || 0;
        if (dpd > 90) score += 40; // Increased weight
        else if (dpd > 60) score += 30;
        else if (dpd > 30) score += 20;
        else if (dpd > 7) score += 10;
        else if (dpd < 7) score -= 10;

        return {
            score: Math.min(100, Math.max(0, score)),
            responseTime,
            daysPastDue: dpd
        };
    }

    /**
     * Analyze financial indicators (30% weight)
     */
    analyzeFinancialIndicators(borrower) {
        let score = 40; // Baseline

        const {
            loanAmount = 0,
            emiAmount = 0,
            outstandingBalance,
            daysPastDue = 0,
            isOverdue = false
        } = borrower;

        // EMI to loan ratio
        if (emiAmount && loanAmount) {
            const emiRatio = (emiAmount / loanAmount) * 100;
            if (emiRatio > 15) score += 15; // High EMI burden
            else if (emiRatio > 10) score += 10;
            else if (emiRatio < 5) score -= 10; // Low burden
        }

        // Outstanding balance pressure
        if (outstandingBalance && loanAmount) {
            const balanceRatio = (outstandingBalance / loanAmount) * 100;
            if (balanceRatio > 80) score += 20; // Most of loan still unpaid
            else if (balanceRatio > 50) score += 10;
            else if (balanceRatio < 20) score -= 15; // Almost paid off
        }

        // Overdue status
        if (isOverdue) {
            score += 15;
            if (daysPastDue > 90) score += 25;
            else if (daysPastDue > 60) score += 15;
            else if (daysPastDue > 30) score += 10;
        }

        return {
            score: Math.min(100, Math.max(0, score)),
            emiRatio: emiAmount / loanAmount,
            balanceRatio: outstandingBalance / loanAmount,
            isOverdue
        };
    }

    /**
     * Get ML model prediction using trained .pkl models (Risk Severity and Bank Action)
     */
    async getMLPrediction(message) {
        try {
            // Import the ML analyzer that runs the Python script
            const { analyzeWithModel } = await import('./nlpAnalyzer.js');

            // Execute Python prediction (loads risk_severity_model.pkl, bank_action_model.pkl, tfidf_vectorizer.pkl)
            const mlResult = await analyzeWithModel(message);

            if (mlResult && mlResult.risk_severity) {
                // Map ML risk_severity to numerical score (0-100)
                const severityMap = {
                    'Low': 25,
                    'Medium': 55,
                    'High': 85,
                    'Critical': 95
                };

                const score = severityMap[mlResult.risk_severity] || 50;

                console.log(`🤖 ML Model Result: Severity=${mlResult.risk_severity}, Action=${mlResult.bank_action}, Score=${score}`);

                return {
                    score,
                    severity: mlResult.risk_severity,
                    bankAction: mlResult.bank_action,
                    confidence: mlResult.confidence || 1.0,
                    isML: true
                };
            }

            // Fallback to simple sentiment if ML model fails
            console.log('⚠️ ML Model unavailable, falling back to heuristic sentiment');
            const sentiment = analyzeSentiment(message);
            let fallbackScore = 50;
            if (sentiment.sentiment === 'High') fallbackScore = 85;
            else if (sentiment.sentiment === 'Moderate') fallbackScore = 60;
            else if (sentiment.sentiment === 'Low') fallbackScore = 30;

            return {
                score: fallbackScore,
                sentiment: sentiment.sentiment,
                isML: false
            };
        } catch (error) {
            console.error('ML prediction pipeline error:', error);
            return { score: 50, sentiment: 'Unknown', isML: false };
        }
    }

    /**
     * Determine stress level from composite score
     */
    determineStressLevel(score) {
        if (score >= 90) return 'Critical';
        if (score >= 70) return 'High';
        if (score >= 40) return 'Moderate';
        return 'Low';
    }

    /**
     * Determine willingness to pay
     */
    determineWillingness(messageScore, financialScore) {
        if (messageScore.showsWillingness) return 'Will Pay';
        if (messageScore.hasRefusal) return 'Refusal';
        if (financialScore.isOverdue && financialScore.score > 70) return 'Struggling';
        return 'Likely to Pay';
    }

    /**
     * Format issue name for display
     */
    formatIssueName(issueType) {
        const mapping = {
            jobLoss: 'Job Loss',
            medical: 'Medical Emergency',
            transport: 'Transport Issue',
            family: 'Family Emergency',
            cashFlow: 'Cash Flow Problem',
            pressure: 'Harassment/Pressure',
            refusal: 'Financial Crisis',
            temporary: 'Temporary Setback'
        };
        return mapping[issueType] || 'General Financial Difficulty';
    }
}

export default new BehavioralScoring();
