
import XLSX from 'xlsx';
import fs from 'fs';
import { differenceInDays } from 'date-fns';
import Borrower from '../models/Borrower.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import EMIRecommendation from '../models/EMIRecommendation.js';
import { generateEMISuggestion } from '../services/aiService.js';

// @desc    Upload and parse XLSX file
// @route   POST /api/borrowers/upload
// @access  Private
export const uploadBorrowers = async (req, res, next) => {
    try {
        console.log('[Upload] Starting processing...');
        if (!req.file) {
            console.error('[Upload] No file received in req.file');
            return res.status(400).json({
                success: false,
                error: 'Please upload a file',
            });
        }
        console.log(`[Upload] Received file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

        // Read the uploaded file
        const workbook = XLSX.readFile(req.file.path);

        let data = [];
        let sheetFound = '';

        // Loop through all sheets to find data
        for (const name of workbook.SheetNames) {
            const sheet = workbook.Sheets[name];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            if (sheetData.length > 0) {
                data = sheetData;
                sheetFound = name;
                break;
            }
        }

        console.log(`[Upload] Data scan complete.Found ${data.length} rows in sheet: "${sheetFound}"`);

        if (data.length === 0) {
            console.error('[Upload] No data found in any sheet of the file');
            // Clean up the uploaded file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'The uploaded file is empty or has no readable rows in any sheet',
            });
        }

        // Process each row
        const borrowers = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const rawRow = data[i];

            // Normalize row keys (trim, lowercase, and handle whitespace/invisible chars)
            const row = {};
            Object.keys(rawRow).forEach(key => {
                const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, ' ');
                row[normalizedKey] = rawRow[key];
            });

            try {
                // Highly flexible mapping with normalized keys
                const getValue = (possibleHeaders) => {
                    for (const header of possibleHeaders) {
                        const normalizedHeader = header.trim().toLowerCase().replace(/\s+/g, ' ');
                        if (row[normalizedHeader] !== undefined && row[normalizedHeader] !== null && row[normalizedHeader] !== '') {
                            return row[normalizedHeader];
                        }
                    }
                    return null;
                };

                const customerName = getValue(['Borrower Name', 'Customer Name', 'Name', 'customer_name', 'BorrowerName']);
                const loanIdRaw = getValue(['Loan Number', 'Loan ID', 'LoanID', 'loan_id', 'LoanNumber']);
                const loanId = loanIdRaw ? String(loanIdRaw) : null;

                const phoneNumberRaw = getValue(['Phone Number', 'Phone', 'phone_number', 'phone', 'PhoneNumber']);
                const phoneNumber = phoneNumberRaw ? String(phoneNumberRaw).replace(/[^0-9]/g, '') : null;

                const loanAmountRaw = getValue(['Principal', 'Loan Amount', 'Amount', 'loan_amount', 'loanAmount']);
                const loanAmount = parseFloat(loanAmountRaw);

                const dueDate = getValue([
                    'Installment Start Repayment Date',
                    'Next Repayment Date',
                    'Due Date',
                    'DueDate',
                    'due_date',
                    'dueDate',
                    'Next Due Date',
                    'Repayment Date',
                    'Last Installment Date',
                    'Disbursal Date',
                    'Next Repayment Da'
                ]);

                const email = getValue([
                    'Email',
                    'Email ID',
                    'Email Address',
                    'email',
                    'Email Address (If any)',
                    'Email ID (If any)',
                    'EmailAddress'
                ]);

                // Financials
                const outstandingRaw = getValue(['Outstanding Loan Amount', 'Outstanding Balance', 'Outstanding', 'outstanding_balance', 'outstandingBalance']);
                const outstandingBalance = parseFloat(outstandingRaw);

                const emiRaw = getValue([
                    'Monthly Installment Amount 1',
                    'Monthly Installment Amount',
                    'EMI Amount',
                    'EMI',
                    'emi_amount',
                    'emiAmount',
                    'Installment Amount'
                ]);
                const emiAmount = parseFloat(emiRaw);

                // Other fields
                const lastPaymentDate = getValue(['Last Payment Date', 'last_payment_date', 'LastPaymentDate']);
                const daysPastDue = parseInt(getValue(['DPD', 'Days Past Due', 'days_past_due', 'daysPastDue', 'DPD Status'])) || 0;
                const address = getValue(['Borrower Address', 'Address', 'Permanent Address', 'BorrowerAddress', 'Location']);
                const totalInstallments = parseInt(getValue(['No. of Installments', 'No. of installments', 'TotalInstallments', 'Tenure', 'No. of Installment']));
                const paidInstallments = parseInt(getValue(['No. of Paid Installments', 'No. of paid installments', 'PaidInstallments', 'Installments Paid', 'of Paid Installments', 'of Paid Installme']));

                // Validate required fields
                const missing = [];
                if (!customerName) missing.push('Name');
                if (!loanId) missing.push('Loan ID/Number');
                if (!phoneNumber) missing.push('Phone');
                if (isNaN(loanAmount)) missing.push('Amount/Principal');
                if (!dueDate) missing.push('Due Date');
                if (!email) missing.push('Email');

                if (missing.length > 0) {
                    errors.push(`Row ${i + 2}: Missing ${missing.join(', ')} `);
                    continue;
                }

                // Parse dates
                let parsedDueDate;
                if (typeof dueDate === 'number') {
                    parsedDueDate = XLSX.SSF.parse_date_code(dueDate);
                    parsedDueDate = new Date(parsedDueDate.y, parsedDueDate.m - 1, parsedDueDate.d);
                } else {
                    parsedDueDate = new Date(dueDate);
                }

                let parsedLastPaymentDate = null;
                if (lastPaymentDate) {
                    if (typeof lastPaymentDate === 'number') {
                        const temp = XLSX.SSF.parse_date_code(lastPaymentDate);
                        parsedLastPaymentDate = new Date(temp.y, temp.m - 1, temp.d);
                    } else {
                        parsedLastPaymentDate = new Date(lastPaymentDate);
                    }
                }

                const today = new Date();
                const calculatedOverdueDays = isNaN(parsedDueDate.getTime()) ? 0 : differenceInDays(today, parsedDueDate);
                const finalOverdueDays = calculatedOverdueDays > 0 ? calculatedOverdueDays : 0;

                borrowers.push({
                    customerName,
                    email,
                    loanId,
                    phoneNumber,
                    loanAmount,
                    dueDate: parsedDueDate,
                    lastPaymentDate: parsedLastPaymentDate,
                    overdueDays: finalOverdueDays,
                    isOverdue: finalOverdueDays > 0,
                    emiAmount,
                    outstandingBalance: isNaN(outstandingBalance) ? 0 : outstandingBalance,
                    daysPastDue: isNaN(daysPastDue) ? finalOverdueDays : daysPastDue,
                    address: address || 'N/A',
                    totalInstallments: isNaN(totalInstallments) ? 0 : totalInstallments,
                    paidInstallments: isNaN(paidInstallments) ? 0 : paidInstallments,
                    uploadedBy: req.user._id,
                });
            } catch (error) {
                errors.push(`Row ${i + 2}: ${error.message} `);
            }
        }

        if (borrowers.length === 0) {
            // Clean up the uploaded file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            // Get keys from the first raw row for debugging
            const firstRowKeys = data.length > 0 ? Object.keys(data[0]) : [];
            console.warn('[Upload] No valid records. Headers found:', firstRowKeys);
            console.warn('[Upload] Errors encountered:', errors.slice(0, 3));

            return res.status(400).json({
                success: false,
                error: 'No valid borrower data found.',
                details: errors.slice(0, 5),
                foundHeaders: firstRowKeys, // Return headers to user for debugging
                message: `Headers found in your file: ${firstRowKeys.join(', ')} `
            });
        }

        // Insert borrowers into database
        const insertedBorrowers = await Borrower.insertMany(borrowers, { ordered: false });

        // Create notification for managers
        await Notification.create({
            recipientRole: 'manager',
            title: 'New Data Uploaded',
            message: `Admin ${req.user.name} uploaded ${insertedBorrowers.length} new borrower records.`,
            type: 'upload'
        });

        // Clean up the uploaded file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            count: insertedBorrowers.length,
            data: insertedBorrowers,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        // Clean up the uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Get all borrowers with filters
// @route   GET /api/borrowers
// @access  Private
export const getBorrowers = async (req, res, next) => {
    try {
        const { status, risk, search, page = 1, limit = 50 } = req.query;

        const query = {};

        // If Manager, show assigned borrowers OR borrowers they uploaded themselves OR unassigned borrowers
        // Also show borrowers uploaded by Admin (who acts as the central distributor)
        if (req.user.role === 'manager') {
            const Admin = (await import('../models/Admin.js')).default;
            const adminIds = await Admin.find().distinct('_id');

            query.$or = [
                { assignedManager: req.user._id },
                { uploadedBy: req.user._id },
                { assignedManager: null },
                { assignedManager: { $exists: false } },
                { uploadedBy: { $in: adminIds } }
            ];
        }

        // If Borrower (role: 'user'), only show their own record
        if (req.user.role === 'user') {
            query._id = req.user._id;
        }

        // If Field Executive, only show assigned borrowers
        if (req.user.role === 'field_executive') {
            query.assignedFieldExecutive = req.user._id;
        }

        // Filter by overdue status
        if (status === 'overdue') {
            query.isOverdue = true;
        }

        // Filter by risk level
        if (risk) {
            query.riskLevel = risk;
        }

        // Search by name, loan ID, or email
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { loanId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const borrowers = await Borrower.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('uploadedBy', 'name email')
            .populate('assignedManager', 'name email')
            .populate('assignedFieldExecutive', 'name email');

        const total = await Borrower.countDocuments(query);

        res.status(200).json({
            success: true,
            count: borrowers.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: borrowers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single borrower by ID
// @route   GET /api/borrowers/:id
// @access  Private
export const getBorrowerById = async (req, res, next) => {
    try {
        const borrower = await Borrower.findById(req.params.id)
            .populate('uploadedBy', 'name email');

        if (!borrower) {
            return res.status(404).json({
                success: false,
                error: 'Borrower not found',
            });
        }

        res.status(200).json({
            success: true,
            data: borrower,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/borrowers/stats
// @access  Private
export const getStats = async (req, res, next) => {
    try {
        const totalBorrowers = await Borrower.countDocuments();
        const overdueBorrowers = await Borrower.countDocuments({ isOverdue: true });
        const callsCompleted = await Borrower.countDocuments({ callStatus: 'completed' });
        const callsNotAnswered = await Borrower.countDocuments({ callStatus: 'not_answered' });
        const plansAccepted = await Borrower.countDocuments({ emiPlanStatus: 'accepted' });

        const highRiskCount = await Borrower.countDocuments({
            riskLevel: { $in: ['HIGH_RISK', 'CRITICAL_RISK'] }
        });

        // Risk level distribution
        const riskDistribution = await Borrower.aggregate([
            {
                $group: {
                    _id: '$riskLevel',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Call status distribution
        const callStatusDistribution = await Borrower.aggregate([
            {
                $group: {
                    _id: '$callStatus',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Recent assignments for Admin tracking
        const recentAssignments = await Borrower.find({})
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('assignedManager', 'name')
            .populate('uploadedBy', 'name email');

        res.status(200).json({
            success: true,
            data: {
                totalBorrowers,
                overdueBorrowers,
                callsCompleted,
                callsNotAnswered,
                plansAccepted,
                highRiskCount,
                riskDistribution,
                callStatusDistribution,
                recentAssignments,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update borrower
// @route   PUT /api/borrowers/:id
// @access  Private
export const updateBorrower = async (req, res, next) => {
    try {
        const borrower = await Borrower.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!borrower) {
            return res.status(404).json({
                success: false,
                error: 'Borrower not found',
            });
        }

        // Trigger AI EMI Plan if risk level is updated to a risk category
        const riskTriggerLevels = ['HIGH_RISK', 'CRITICAL_RISK', 'MODERATE_RISK'];
        if (req.body.riskLevel && riskTriggerLevels.includes(req.body.riskLevel)) {
            const existingPending = await EMIRecommendation.findOne({
                borrowerId: borrower._id,
                status: 'Pending'
            });

            if (!existingPending) {
                const suggestionRisk = req.body.riskLevel;
                const suggestion = generateEMISuggestion(borrower.loanAmount, suggestionRisk);

                await EMIRecommendation.create({
                    borrowerId: borrower._id,
                    managerId: req.user._id,
                    riskLevel: suggestionRisk,
                    suggestedEMI: suggestion.suggestedEMI,
                    extendedTenure: suggestion.extendedTenure,
                    gracePeriod: suggestion.gracePeriod,
                    status: 'Pending'
                });

                borrower.emiPlanStatus = 'pending';
                await borrower.save();
                console.log(`Auto - triggered EMI plan for ${borrower.customerName} after risk analysis recorded as ${req.body.riskLevel} `);
            }
        }

        res.status(200).json({
            success: true,
            data: borrower,
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Assign borrower to manager
// @route   PUT /api/borrowers/:id/assign
// @access  Private (Admin only)
export const assignBorrower = async (req, res, next) => {
    try {
        const { managerId } = req.body;

        const borrower = await Borrower.findByIdAndUpdate(
            req.params.id,
            { assignedManager: managerId },
            { new: true }
        );

        if (!borrower) {
            return res.status(404).json({ success: false, error: 'Borrower not found' });
        }

        res.status(200).json({
            success: true,
            data: borrower
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign borrower to field executive
// @route   PUT /api/borrowers/:id/assign-field
// @access  Private (Admin or Manager only)
export const assignFieldExecutive = async (req, res, next) => {
    try {
        const { fieldExecutiveId } = req.body;
        const borrowerId = req.params.id;

        const borrower = await Borrower.findById(borrowerId);

        if (!borrower) {
            return res.status(404).json({ success: false, error: 'Borrower not found' });
        }

        // Restrict assignment to HIGH_RISK or CRITICAL_RISK only
        const allowedRisks = ['HIGH_RISK', 'CRITICAL_RISK'];
        if (!allowedRisks.includes(borrower.riskLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Field Executives can only be assigned to High Risk or Critical Risk borrowers'
            });
        }

        borrower.assignedFieldExecutive = fieldExecutiveId;
        await borrower.save();

        res.status(200).json({
            success: true,
            data: borrower
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit a field visit report with GPS-locked photo
// @route   POST /api/borrowers/:id/visit
// @access  Private (Field Executive only)
export const submitFieldVisit = async (req, res, next) => {
    try {
        const borrowerId = req.params.id;
        const { notes, latitude, longitude } = req.body;

        console.log(`[FieldVisit] Processing submission for Borrower: ${borrowerId} `);
        console.log(`[FieldVisit] Request Body: `, JSON.stringify(req.body));

        if (!req.file) {
            console.error(`[FieldVisit] No file received in request`);
            return res.status(400).json({
                success: false,
                error: 'Photo is required for field visit verification. Ensure you select a valid image file.'
            });
        }

        const uploadPath = req.file.path;
        console.log(`[FieldVisit] File uploaded to: ${uploadPath} (${req.file.mimetype})`);

        // Parse EXIF data for GPS
        const buffer = fs.readFileSync(uploadPath);
        const exifParser = (await import('exif-parser')).default;
        const parser = exifParser.create(buffer);
        let result;
        try {
            result = parser.parse();
            console.log(`[FieldVisit] EXIF tags found: `, Object.keys(result.tags));
        } catch (e) {
            console.warn(`[FieldVisit] EXIF parsing failed: ${e.message} `);
            result = { tags: {} };
        }

        let finalLat = result.tags.gps?.GPSLatitude;
        let finalLng = result.tags.gps?.GPSLongitude;

        // Fallback to request body if EXIF is missing
        if (!finalLat || !finalLng) {
            const { latitude, longitude } = req.body;
            if (latitude && longitude) {
                finalLat = parseFloat(latitude);
                finalLng = parseFloat(longitude);
                console.log(`[GPS] Using fallback coordinates from request body: ${finalLat}, ${finalLng} `);
            }
        }

        if (!finalLat || !finalLng) {
            // Delete invalid photo
            fs.unlinkSync(uploadPath);
            return res.status(400).json({
                success: false,
                error: 'GPS VERIFICATION FAILED: This photo contains no location metadata and no fallback coordinates were provided. To verify your on-ground presence, please ensure Location Services are enabled on your device.'
            });
        }

        const borrower = await Borrower.findById(borrowerId);
        if (!borrower) {
            fs.unlinkSync(uploadPath);
            return res.status(404).json({ success: false, error: 'Borrower record not found in tactical database.' });
        }

        const visitData = {
            photoUrl: `/ ${uploadPath.replace(/\\/g, '/')} `, // Normalize path for web
            latitude: finalLat,
            longitude: finalLng,
            notes: notes || 'Mission accomplished. No additional notes.',
            visitedAt: new Date()
        };

        borrower.fieldVisits.push(visitData);
        borrower.callStatus = 'completed'; // Mark the field task as completed
        await borrower.save();

        res.status(200).json({
            success: true,
            message: 'Field visit verified and intelligence synchronized.',
            data: visitData
        });
    } catch (error) {
        // Cleanup on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Upload field visit report and notify admin
// @route   POST /api/borrowers/upload-report
// @access  Private (Field Executive only)
export const uploadFieldReport = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No report file uploaded' });
        }

        const fieldExecutiveName = req.user.name;
        const uploadPath = req.file.path;

        // Create Report document
        await Report.create({
            title: `Visit Report - ${fieldExecutiveName} - ${new Date().toLocaleDateString()}`,
            url: uploadPath,
            uploadedBy: req.user._id,
            type: 'visit_history_csv'
        });

        // Create notification for Admin
        await Notification.create({
            recipientRole: 'admin',
            title: 'New Field Report',
            message: `Field Executive ${fieldExecutiveName} has submitted a new visit report.`,
            type: 'upload',
            isRead: false,
            relatedData: {
                downloadUrl: `${process.env.API_URL || 'http://localhost:5000'}/${uploadPath.replace(/\\/g, '/')}`
            }
        });

        res.status(200).json({
            success: true,
            message: 'Report uploaded and Admin notified successfully.',
            data: { filePath: uploadPath }
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

// @desc    Get all uploaded reports
// @route   GET /api/borrowers/reports
// @access  Private (Admin only)
export const getReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('uploadedBy', 'name email');

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};
