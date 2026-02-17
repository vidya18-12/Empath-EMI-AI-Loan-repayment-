import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Manager from '../models/Manager.js';
import Borrower from '../models/Borrower.js';
import FieldExecutive from '../models/FieldExecutive.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from any of the collections
        req.user = await Admin.findById(decoded.id).select('-password') ||
            await Manager.findById(decoded.id).select('-password') ||
            await FieldExecutive.findById(decoded.id).select('-password') ||
            await Borrower.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
        });
    }
};

// Grant access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
