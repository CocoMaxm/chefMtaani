const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: [true, 'Bio is required'], maxlength: [500, 'Bio cannot exceed 500 characters'] },
    experience: { type: Number, required: [true, 'Years of experience is required'], min: [1, 'Minimum 1 year of experience required'] },
    cuisineSpecialization: { type: String, required: [true, 'Cuisine specialization is required'], enum: ['Italian', 'French', 'Asian', 'Mexican', 'Indian', 'Mediterranean', 'American', 'Other'] },
    additionalCuisines: [{ type: String }],
    hourlyRate: { type: Number, required: [true, 'Hourly rate is required'], min: [50, 'Minimum hourly rate is $50'] },
    serviceLocation: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        maxTravelDistance: { type: Number, default: 25 }// miles 
    },
    availability: {
        type: Map,
        of: Boolean,
        default: {
            monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
        }
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    profileImage: { type: String, default: null },
    certifications: [{ name: String, issuer: String, dateObtained: Date }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Create index for location-based queries
chefSchema.index({ 'serviceLocation.city': 1, 'serviceLocation.state': 1 });
chefSchema.index({ cuisineSpecialization: 1 });
chefSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Chef', chefSchema);