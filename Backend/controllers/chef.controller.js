const Chef = require('../models/Chef.model');
const User = require('../models/User.model');

// @desc    Get all chefs
// @route   GET /api/chefs
// @access  Public
exports.getChefs = async (req, res, next) => {
    try {
        const { cuisine, city, state, minPrice, maxPrice, minRating, sortBy } = req.query;

        // Build query
        const query = { isActive: true, isVerified: true };
        if (cuisine) {
            query.cuisineSpecialization = cuisine;
        }
        if (city) {
            query['serviceLocation.city'] = new RegExp(city, 'i');
        }
        if (state) {
            query['serviceLocation.state'] = state;
        }
        if (minPrice || maxPrice) {
            query.hourlyRate = {};
            if (minPrice) query.hourlyRate.$gte = Number(minPrice);
            if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
        }
        if (minRating) {
            query['rating.average'] = { $gte: Number(minRating) };
        }

        // Build sort
        let sort = {};
        if (sortBy === 'price-low') sort.hourlyRate = 1;
        else if (sortBy === 'price-high') sort.hourlyRate = -1;
        else if (sortBy === 'rating') sort['rating.average'] = -1;
        else sort.createdAt = -1;

        const chefs = await Chef.find(query)
            .populate('user', 'firstName lastName email')
            .sort(sort);

        res.status(200).json({
            success: true,
            count: chefs.length,
            data: chefs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single chef
// @route   GET /api/chefs/:id
// @access  Public
exports.getChef = async (req, res, next) => {
    try {
        const chef = await Chef.findById(req.params.id)
            .populate('user', 'firstName lastName email');

        if (!chef) {
            return res.status(404).json({
                success: false,
                error: 'Chef not found'
            });
        }

        res.status(200).json({
            success: true,
            data: chef
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update chef profile
// @route   PUT /api/chefs/:id
// @access  Private (Chef only)
exports.updateChef = async (req, res, next) => {
    try {
        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            return res.status(404).json({
                success: false,
                error: 'Chef not found'
            });
        }

        // Make sure chef owns this profile
        if (chef.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this profile'
            });
        }

        const updatedChef = await Chef.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: updatedChef
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get chef availability
// @route   GET /api/chefs/:id/availability
// @access  Public
exports.getChefAvailability = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const bookings = await Booking.find({
            chef: req.params.id,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            status: { $in: ['confirmed', 'pending'] }
        }).select('date');

        const bookedDates = bookings.map(booking => booking.date.toISOString().split('T')[0]);

        res.status(200).json({
            success: true,
            data: bookedDates
        });
    } catch (err) {
        next(err);
    }
};