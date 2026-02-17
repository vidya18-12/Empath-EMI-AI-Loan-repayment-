import express from 'express';
import { sendMessage, getConversation, getChatPartners } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/partners', getChatPartners);
router.get('/:otherId', getConversation);

export default router;
