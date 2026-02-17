import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import borrowerRoutes from './routes/borrowers.js';
import analysisRoutes from './routes/analysis.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';
import chatbotRoutes from './routes/chatbot.js';
import { initScheduler } from './services/scheduler.js';

// Initialize app
const app = express();

// Initialize Scheduler
initScheduler();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Loan Recovery System API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│  🚀 AI Loan Recovery System - Backend API      │');
    console.log('├─────────────────────────────────────────────────┤');
    console.log(`│  Server: http://localhost:${PORT}                  │`);
    console.log(`│  Environment: ${process.env.NODE_ENV || 'development'}                      │`);
    console.log('└─────────────────────────────────────────────────┘');
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
