import mongoose from 'mongoose';

const behaviorAnalysisSchema = new mongoose.Schema({
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower',
        required: true,
    },
    // field removed
    classification: {
        type: String,
        enum: ['WILL_PAY', 'MAY_PAY', 'RISKY', 'WILL_NOT_PAY', 'NO_RESPONSE'],
        required: true,
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    sentimentScore: {
        type: Number,
        min: -1,
        max: 1,
        default: 0,
    },
    aiSummary: {
        type: String,
        required: true,
    },
    keyFindings: [{
        type: String,
    }],
    recommendation: {
        type: String,
        enum: ['follow_up', 'legal_notice', 'field_visit', 'payment_reminder', 'no_action'],
        required: true,
    },
    analysisDetails: {
        willingnessToPay: String,
        paymentCommitment: String,
        excusePattern: String,
        toneAnalysis: String,
    },
    analyzedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
behaviorAnalysisSchema.index({ borrower: 1 });
behaviorAnalysisSchema.index({ classification: 1 });
behaviorAnalysisSchema.index({ riskScore: -1 });

export default mongoose.model('BehaviorAnalysis', behaviorAnalysisSchema);
