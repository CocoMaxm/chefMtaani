const Chef = require('../models/Chef.model');

// @desc    Get all cuisines with chef count
// @route   GET /api/cuisines
// @access  Public
exports.getCuisines = async (req, res, next) => {
    try {
        const cuisines = await Chef.aggregate([
            { $match: { isActive: true, isVerified: true } },
            {
                $group: {
                    _id: '$cuisineSpecialization',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$hourlyRate' },
                    avgRating: { $avg: '$rating.average' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const cuisineData = cuisines.map(cuisine => ({
            name: cuisine._id,
            chefCount: cuisine.count,
            averagePrice: Math.round(cuisine.avgPrice),
            averageRating: Math.round(cuisine.avgRating * 10) / 10
        }));

        res.status(200).json({
            success: true,
            data: cuisineData
        });
    } catch (err) {
        next(err);
    }
};