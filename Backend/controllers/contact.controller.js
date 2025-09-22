const Contact = require('../models/Contact.model');
const sendEmail = require('../utils/email.util');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Create contact entry
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // Send email to admin
        await sendEmail({
            email: 'admin@chefconnect.com',
            subject: `New Contact Form Submission - ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        // Send confirmation email to user
        await sendEmail({
            email: email,
            subject: 'We received your message',
            html: `
                <h2>Thank you for contacting ChefConnect!</h2>
                <p>We've received your message and will get back to you within 24-48 hours.</p>
                <p>If your inquiry is urgent, please call us at (555) 123-4567.</p>
            `
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully'
        });
    } catch (err) {
        next(err);
    }
};