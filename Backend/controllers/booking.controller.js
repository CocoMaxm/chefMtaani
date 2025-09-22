const Booking = require('../models/Booking.model');
const Chef = require('../models/Chef.model');
const User = require('../models/User.model');
const sendEmail = require('../utils/email.util');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
    try {
        const { chefId, date, startTime, duration, numberOfGuests, address, specialRequests } = req.body;

        // Get chef details
        const chef = await Chef.findById(chefId).populate('user');

        if (!chef) {
            return res.status(404).json({
                success: false,
                error: 'Chef not found'
            });
        }

        // Check if chef is available on this date
        const existingBooking = await Booking.findOne({
            chef: chefId,
            date: new Date(date),
            status: { $in: ['confirmed', 'pending'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                error: 'Chef is not available on this date'
            });
        }

        // Calculate total price
        const totalPrice = chef.hourlyRate * duration;

        // Create booking
        const booking = await Booking.create({
            customer: req.user.id,
            chef: chefId,
            date,
            startTime,
            duration,
            numberOfGuests,
            address,
            specialRequests,
            totalPrice
        });

        // Send email to chef
        await sendEmail({
            email: chef.user.email,
            subject: 'New Booking Request',
            html: `
                <h2>You have a new booking request!</h2>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${startTime}</p>
                <p><strong>Duration:</strong> ${duration} hours</p>
                <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
                <p><strong>Location:</strong> ${address.street}, ${address.city}, ${address.state} ${address.zipCode}</p>
                ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
                <p><strong>Total Price:</strong> $${totalPrice}</p>
                <p>Please log in to your dashboard to confirm or decline this booking.</p>
            `
        });

        // Send confirmation email to customer
        const customer = await User.findById(req.user.id);
        await sendEmail({
            email: customer.email,
            subject: 'Booking Confirmation',
            html: `
                <h2>Your booking request has been submitted!</h2>
                <p>We've notified Chef ${chef.user.firstName} ${chef.user.lastName} about your booking request.</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${startTime}</p>
                <p><strong>Duration:</strong> ${duration} hours</p>
                <p><strong>Total Price:</strong> $${totalPrice}</p>
                <p>You'll receive another email once the chef confirms your booking.</p>
            `
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
    try {
        let query;
        if (req.user.role === 'customer') {
            query = { customer: req.user.id };
        } else if (req.user.role === 'chef') {
            const chef = await Chef.findOne({ user: req.user.id });
            query = { chef: chef._id };
        }

        const bookings = await Booking.find(query)
            .populate('chef')
            .populate('customer', 'firstName lastName email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Chef)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id)
            .populate('customer')
            .populate('chef');

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Verify chef owns this booking
        const chef = await Chef.findOne({ user: req.user.id });
        if (booking.chef._id.toString() !== chef._id.toString()) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this booking'
            });
        }

        booking.status = status;
        await booking.save();

        // Send email to customer about status update
        let emailSubject, emailContent;
        if (status === 'confirmed') {
            emailSubject = 'Booking Confirmed!';
            emailContent = `
                <h2>Great news! Your booking has been confirmed.</h2>
                <p>Chef ${req.user.firstName} ${req.user.lastName} has confirmed your booking for ${new Date(booking.date).toLocaleDateString()}.</p>
                <p>The chef will arrive at ${booking.startTime} and cook for ${booking.duration} hours.</p>
            `;
        } else if (status === 'cancelled') {
            emailSubject = 'Booking Cancelled';
            emailContent = `
                <h2>Your booking has been cancelled.</h2>
                <p>Unfortunately, Chef ${req.user.firstName} ${req.user.lastName} had to cancel your booking for ${new Date(booking.date).toLocaleDateString()}.</p>
                <p>Please visit our website to book another chef.</p>
            `;
        }

        if (emailSubject) {
            await sendEmail({
                email: booking.customer.email,
                subject: emailSubject,
                html: emailContent
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private (Customer)
exports.addReview = async (req, res, next) => {
    try {
        const { score, review } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Verify customer owns this booking
        if (booking.customer.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to review this booking'
            });
        }

        // Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Can only review completed bookings'
            });
        }

        // Add review
        booking.rating = {
            score,
            review,
            reviewDate: Date.now()
        };
        await booking.save();

        // Update chef's average rating
        const chef = await Chef.findById(booking.chef);
        const allBookings = await Booking.find({
            chef: chef._id,
            'rating.score': { $exists: true }
        });
        const totalRating = allBookings.reduce((sum, b) => sum + b.rating.score, 0);
        const averageRating = totalRating / allBookings.length;
        chef.rating = {
            average: averageRating,
            count: allBookings.length
        };
        await chef.save();

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        next(err);
    }
};