const User = require('../models/User.model');
const Chef = require('../models/Chef.model');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email.util');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || 'customer'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Register chef
// @route   POST /api/auth/register-chef
// @access  Public
exports.registerChef = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            bio,
            experience,
            cuisineSpecialization,
            hourlyRate,
            serviceLocation
        } = req.body;

        // Extract city, default state to empty string if not provided
        const city = serviceLocation?.city || "";
        const state = serviceLocation?.state || "";

        // Create user with chef role
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'chef'
        });

        // Create chef profile
        const chef = await Chef.create({
            user: user._id,
            bio,
            experience,
            cuisineSpecialization,
            hourlyRate,
            serviceLocation: { city, state } // always save both
        });

        // Send welcome email
        await sendEmail({
            email: user.email,
            subject: 'Welcome to ChefConnect',
            html: `
                <h1>Welcome ${firstName}!</h1>
                <p>Thank you for joining ChefConnect as a chef. Your profile is under review and will be activated within 48 hours.</p>
                <p>Once approved, you'll start receiving booking requests from customers in your area.</p>
            `
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            chef
        });
    } catch (err) {
        next(err);
    }
};
