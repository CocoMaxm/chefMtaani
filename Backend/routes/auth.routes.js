const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { register, login, registerChef } = require('../controllers/auth.controller');

router.post('/register', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], register);

router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], login);

router.post('/register-chef', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('bio').notEmpty().withMessage('Bio is required'),
    body('experience').isInt({ min: 1 }).withMessage('Experience must be at least 1 year'),
    body('cuisineSpecialization').notEmpty().withMessage('Cuisine specialization is required'),
    body('hourlyRate').isFloat({ min: 20 }).withMessage('Hourly rate must be at least $20'),
    body('serviceLocation.city').notEmpty().withMessage('City is required'),
    validate
], registerChef);

module.exports = router;