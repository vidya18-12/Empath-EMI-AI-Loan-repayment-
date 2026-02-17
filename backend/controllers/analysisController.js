import BehaviorAnalysis from '../models/BehaviorAnalysis.js';

// @desc    Get all behavior analyses
// @route   GET /api/analysis
// @access  Private
export const getBehaviorAnalysis = async (req, res, next) => {
    try {
        const { classification, page = 1, limit = 20 } = req.query;

        const query = {};

        if (classification) {
            query.classification = classification;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const analyses = await BehaviorAnalysis.find(query)
            .sort({ analyzedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('borrower', 'customerName loanId phoneNumber loanAmount')
            .populate('callRecord', 'attemptNumber callTimestamp status');

        const total = await BehaviorAnalysis.countDocuments(query);

        res.status(200).json({
            success: true,
            count: analyses.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: analyses,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get behavior analysis for specific borrower
// @route   GET /api/analysis/borrower/:borrowerId
// @access  Private
export const getBehaviorByBorrower = async (req, res, next) => {
    try {
        const analysis = await BehaviorAnalysis.findOne({
            borrower: req.params.borrowerId,
        })
            .populate('borrower', 'customerName loanId phoneNumber loanAmount overdueDays')
            .populate('callRecord', 'attemptNumber callTimestamp status duration transcript');

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'No behavior analysis found for this borrower',
            });
        }

        res.status(200).json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        next(error);
    }
};
