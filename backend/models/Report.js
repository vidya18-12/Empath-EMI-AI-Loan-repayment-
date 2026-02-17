import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['visit_history_csv'],
        default: 'visit_history_csv',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Report', reportSchema);
