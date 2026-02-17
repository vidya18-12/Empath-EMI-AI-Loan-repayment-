import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipientRole: {
        type: String,
        enum: ['manager', 'admin'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['upload', 'alert', 'system'],
        default: 'upload',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    relatedData: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Notification', notificationSchema);
