import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    startAutomatedOutreach,
    processBorrowerReply,
    getChatbotConversations,
    getConversation,
    deleteConversation
} from '../controllers/chatbotController.js';

const router = express.Router();

// All routes require authentication and manager role
router.use(protect);
router.use(authorize('manager', 'admin'));

// @route   POST /api/chatbot/start
// @desc    Start automated outreach for overdue borrowers
router.post('/start', startAutomatedOutreach);

// @route   POST /api/chatbot/process-reply/:borrowerId
// @desc    Process borrower reply and suggest EMI plans
router.post('/process-reply/:borrowerId', processBorrowerReply);

// @route   GET /api/chatbot/conversations
// @desc    Get all active chatbot conversations
router.get('/conversations', getChatbotConversations);

// @route   GET /api/chatbot/conversation/:borrowerId
// @desc    Get specific conversation
router.get('/conversation/:borrowerId', getConversation);

// @route   DELETE /api/chatbot/conversation/:borrowerId
// @desc    Delete automated conversation
router.delete('/conversation/:borrowerId', deleteConversation);

export default router;
