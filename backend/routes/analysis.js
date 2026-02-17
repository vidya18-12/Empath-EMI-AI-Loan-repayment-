import express from 'express';
import {
    getBehaviorAnalysis,
    getBehaviorByBorrower
} from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/analysis
// @desc    Get all behavior analyses with filters
// @access  Private
router.get('/', getBehaviorAnalysis);

// @route   GET /api/analysis/borrower/:borrowerId
// @desc    Get behavior analysis for specific borrower
// @access  Private
router.get('/borrower/:borrowerId', getBehaviorByBorrower);

export default router;
