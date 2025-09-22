const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://chefmtaani.onrender.com'
        : 'http://localhost:5000',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);

// ✅ API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/chefs', require('./routes/chef.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/cuisines', require('./routes/cuisine.routes'));
app.use('/api/contact', require('./routes/contact.routes'));

// ✅ Serve frontend (plain HTML/CSS/JS)
const frontendPath = path.join(__dirname, '..', 'Frontend');
app.use(express.static(frontendPath));

// ✅ Catch-all: send index.html for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// DB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
