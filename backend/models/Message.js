import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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
    sender: {
        type: String,
        enum: ['manager', 'borrower'],
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isAutomated: {
        type: Boolean,
        default: false,
    },
    conversationState: {
        type: String,
        enum: ['initiated', 'awaiting_response', 'analyzing', 'plan_suggested', 'plan_accepted', 'plan_rejected', 'resolved'],
        default: 'awaiting_response',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative', 'stressed', 'High', 'Moderate', 'Low', 'Unknown'],
        default: 'Unknown',
    },
    riskScore: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Message', messageSchema);
