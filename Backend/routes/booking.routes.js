const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');
const { createBooking, getMyBookings, updateBookingStatus, addReview } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(protect, getMyBookings)
    .post(protect, authorize('customer'), [
        body('chefId').notEmpty().withMessage('Chef ID is required'),
        body('date').isISO8601().withMessage('Valid date is required'),
        body('startTime').notEmpty().withMessage('Start time is required'),
        body('duration').isInt({ min: 2, max: 8 }).withMessage('Duration must be between 2-8 hours'),
        body('numberOfGuests').isInt({ min: 1, max: 50 }).withMessage('Number of guests must be between 1-50'),
        body('address.street').notEmpty().withMessage('Street address is required'),
        body('address.city').notEmpty().withMessage('City is required'),
        body('address.state').notEmpty().withMessage('State is required'),
        body('address.zipCode').notEmpty().withMessage('Zip code is required'),
        validate
    ], createBooking);

router.put('/:id/status', protect, authorize('chef'), [
    body('status').isIn(['confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
    validate
], updateBookingStatus);

router.post('/:id/review', protect, authorize('customer'), [
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1-5'),
    body('review').notEmpty().withMessage('Review is required'),
    validate
], addReview);

module.exports = router;