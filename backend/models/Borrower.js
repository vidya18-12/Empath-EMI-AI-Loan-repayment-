import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const borrowerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        default: 'user',
    },
    loanId: {
        type: String,
        required: [true, 'Loan ID is required'],
        unique: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    loanAmount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: 0,
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    lastPaymentDate: {
        type: Date,
    },
    overdueDays: {
        type: Number,
        default: 0,
    },
    isOverdue: {
        type: Boolean,
        default: false,
    },
    emiAmount: {
        type: Number,
        min: 0,
    },
    emiDueDate: {
        type: Date,
    },
    outstandingBalance: {
        type: Number,
        min: 0,
    },
    daysPastDue: {
        type: Number,
        default: 0,
    },
    address: {
        type: String,
        trim: true,
    },
    totalInstallments: {
        type: Number,
    },
    paidInstallments: {
        type: Number,
    },
    // field removed
    riskLevel: {
        type: String,
        enum: ['NORMAL_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'CRITICAL_RISK', 'PENDING'],
        default: 'PENDING',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
    },
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager',
    },
    assignedFieldExecutive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FieldExecutive',
    },
    emiPlanStatus: {
        type: String,
        enum: ['none', 'pending', 'accepted', 'rejected'],
        default: 'none',
    },
    behavioralAnalysis: {
        stressLevel: {
            type: String,
            enum: ['Low', 'Moderate', 'High', 'Critical', 'Unknown'],
            default: 'Unknown',
        },
        primaryIssue: {
            type: String,
            trim: true,
        },
        willingnessToPay: {
            type: String,
            enum: ['Will Pay', 'Likely to Pay', 'Struggling', 'Refusal', 'Unknown'],
            default: 'Unknown',
        },
        lastAnalysisDate: {
            type: Date,
        },
        detailedInsights: {
            type: String,
            trim: true,
        },
    },
    fieldVisits: [{
        photoUrl: String,
        latitude: Number,
        longitude: Number,
        notes: String,
        visitedAt: {
            type: Date,
            default: Date.now
        }
    }],
    nextReviewDate: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
borrowerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    this.updatedAt = Date.now();
    next();
});

// Method to compare password
borrowerSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
borrowerSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Index for faster queries
borrowerSchema.index({ loanId: 1 });
borrowerSchema.index({ email: 1 });
borrowerSchema.index({ isOverdue: 1 });
borrowerSchema.index({ callStatus: 1 });

export default mongoose.model('Borrower', borrowerSchema);
