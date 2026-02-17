import mongoose from 'mongoose';

const emiRecommendationSchema = new mongoose.Schema({
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower',
        required: true,
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
        required: true,
    },
    riskLevel: {
        type: String,
        required: true,
    },
    suggestedEMI: {
        type: Number,
        required: true,
    },
    extendedTenure: {
        type: Number, // in months
        default: 0,
    },
    gracePeriod: {
        type: Number, // in days
        default: 0,
    },
    interestWaiver: {
        type: Number, // percentage
        default: 0,
    },
    planType: {
        type: String,
        enum: ['A', 'B', 'custom'],
        default: 'custom',
    },
    isAutomated: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Superseded'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('EMIRecommendation', emiRecommendationSchema);
