import express from 'express';
import multer from 'multer';
import {
    uploadBorrowers,
    getBorrowers,
    getBorrowerById,
    getStats,
    updateBorrower,
    assignBorrower,
    assignFieldExecutive,
    submitFieldVisit,
    uploadFieldReport,
    getReports
} from '../controllers/borrowerController.js';
import {
    getEMISuggestion,
    createRecommendation,
    updateRecommendationStatus,
    getLatestRecommendation,
    restorePlanA
} from '../controllers/emiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log(`[Multer] Receiving file: ${file.originalname} (${file.mimetype})`);

        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream', // Some browsers send this for binary files
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'text/csv' // Allow CSV
        ];

        const extension = file.originalname.split('.').pop().toLowerCase();
        const allowedExtensions = ['xlsx', 'xls', 'jpeg', 'jpg', 'png', 'webp', 'heic', 'csv'];

        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            console.warn(`[Multer] Rejected file type: ${file.mimetype}, Extension: ${extension}`);
            const error = new Error(`Invalid file type (${file.mimetype}). Support: Excel, CSV, JPEG, PNG, WEBP.`);
            error.statusCode = 400; // Explicitly set 400 for bad file type
            cb(error);
        }
    },
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    },
});

// All routes are protected
router.use(protect);

// @route   POST /api/borrowers/upload
// @desc    Upload and parse XLSX file
// @access  Private
router.post('/upload', upload.single('file'), uploadBorrowers);

// @route   GET /api/borrowers
// @desc    Get all borrowers (with filters)
// @access  Private
router.get('/', getBorrowers);

// @route   GET /api/borrowers/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', getStats);

// @route   GET /api/borrowers/:id
// @desc    Get single borrower
// @access  Private
router.get('/:id', getBorrowerById);

// @route   PUT /api/borrowers/:id
// @desc    Update borrower
// @access  Private
router.put('/:id', authorize('admin', 'manager', 'field_executive'), updateBorrower);

// @route   PUT /api/borrowers/:id/assign-field
// @desc    Assign borrower to field executive
// @access  Private (Admin or Manager only)
router.put('/:id/assign-field', authorize('admin', 'manager'), assignFieldExecutive);

// @route   POST /api/borrowers/:id/visit
// @desc    Submit a field visit report with GPS-locked photo
// @access  Private (Field Executive only)
router.post('/:id/visit', authorize('field_executive'), upload.single('photo'), submitFieldVisit);

// @route   POST /api/borrowers/upload-report
// @desc    Upload field visit report to admin
// @access  Private (Field Executive only)
router.post('/upload-report', authorize('field_executive'), upload.single('file'), uploadFieldReport);

// @route   GET /api/borrowers/reports
// @desc    Get all uploaded reports
// @access  Private (Admin only)
router.get('/reports', authorize('admin'), getReports);

// EMI Recommendation routes
router.get('/:id/suggest-emi', authorize('manager'), getEMISuggestion);
router.post('/:id/recommend-emi', authorize('manager'), createRecommendation);
router.get('/:id/latest-recommendation', getLatestRecommendation);
router.put('/recommendations/:id', authorize('user'), updateRecommendationStatus);
router.post('/:id/restore-plan-a', authorize('user'), restorePlanA);

export default router;
