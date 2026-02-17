import { validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import Manager from '../models/Manager.js';
import Borrower from '../models/Borrower.js';
import FieldExecutive from '../models/FieldExecutive.js';

const getModelByRole = (role) => {
    switch (role) {
        case 'admin': return Admin;
        case 'manager': return Manager;
        case 'field_executive': return FieldExecutive;
        case 'user': return Borrower;
        default: return Manager;
    }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join('. ');
        return res.status(400).json({
            success: false,
            error: errorMsg,
            errors: errors.array(),
        });
    }

    try {
        const { name, email, password, role, phone } = req.body;
        const targetRole = role || 'manager';
        const Model = getModelByRole(targetRole);

        // Check if email already used for Admin or Manager
        const existingAdmin = await Admin.findOne({ email });
        const existingManager = await Manager.findOne({ email });

        if (existingAdmin || existingManager) {
            return res.status(400).json({
                success: false,
                error: 'Account already exists with this email',
            });
        }

        // Check Borrower collection
        let existingBorrower = await Borrower.findOne({
            $or: [
                { email },
                ...(phone ? [{ phoneNumber: phone }] : [])
            ]
        }).select('+password');

        let user;
        if (existingBorrower) {
            if (targetRole === 'user') {
                if (existingBorrower.password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Borrower account already registered. Please login.',
                    });
                }
                // Update existing record
                existingBorrower.customerName = name || existingBorrower.customerName;
                existingBorrower.password = password;
                user = await existingBorrower.save();
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Email already associated with a Borrower account',
                });
            }
        } else {
            // New user registration
            if (targetRole === 'user') {
                return res.status(400).json({
                    success: false,
                    error: 'Borrower record not found in system. Please contact support.',
                });
            }

            user = await Model.create({
                name,
                email,
                password,
                role: targetRole,
            });
        }

        const token = user.generateToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name || user.customerName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email or phone number already in use'
            });
        }
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    try {
        const { email, password, role } = req.body;

        // If role is provided, search specific collection, otherwise search all
        let user = null;
        let Model = null;

        if (role) {
            Model = getModelByRole(role);
            user = await Model.findOne({ email }).select('+password');
        } else {
            // Search all collections if role not provided
            user = await Admin.findOne({ email }).select('+password') ||
                await Manager.findOne({ email }).select('+password') ||
                await FieldExecutive.findOne({ email }).select('+password') ||
                await Borrower.findOne({ email }).select('+password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Check password
        if (!user.password) {
            return res.status(401).json({
                success: false,
                error: 'Account not yet registered. Please register first.',
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
        }

        // Generate token
        const token = user.generateToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name || user.customerName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all managers
// @route   GET /api/auth/managers
// @access  Private (Admin only)
export const getManagers = async (req, res, next) => {
    try {
        const managers = await Manager.find({});
        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all field executives
// @route   GET /api/auth/field-executives
// @access  Private (Admin or Manager only)
export const getFieldExecutives = async (req, res, next) => {
    try {
        const fieldExecutives = await FieldExecutive.find({});
        res.status(200).json({
            success: true,
            data: fieldExecutives
        });
    } catch (error) {
        next(error);
    }
};
