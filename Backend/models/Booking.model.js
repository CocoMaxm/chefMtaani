const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true, min: [2, 'Minimum booking duration is 2 hours'], max: [8, 'Maximum booking duration is 8 hours'] },
    numberOfGuests: { type: Number, required: true, min: [1, 'Minimum 1 guest'], max: [50, 'Maximum 50 guests'] },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    specialRequests: { type: String, maxlength: 1000 },
    menuType: { type: String, enum: ['chef-choice', 'custom', 'pre-set'], default: 'chef-choice' },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    rating: {
        score: { type: Number, min: 1, max: 5 },
        review: String,
        reviewDate: Date
    },
    cancellationReason: String,
    createdAt: { type: Date, default: Date.now }
});

// Compound index for checking chef availability
bookingSchema.index({ chef: 1, date: 1, status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);