const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// ---------------- Security ----------------
app.use(helmet());

// ---------------- CORS ----------------
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        'https://chefmtaani.onrender.com',   // deployed frontend
        'https://chefmtaani.onrender.com'   // deployed backend if frontend calls backend
      ]
    : [
        'http://127.0.0.1:5500',             // local frontend (VS Code Live Server)
        'http://localhost:5500'              // alternative local frontend
      ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ---------------- Body parser ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- Rate limiting ----------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api', limiter);

// ---------------- API Routes ----------------
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/chefs', require('./routes/chef.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/cuisines', require('./routes/cuisine.routes'));
app.use('/api/contact', require('./routes/contact.routes'));

// ---------------- Serve Frontend ----------------
const frontendPath = path.join(__dirname, '..', 'Frontend');
app.use(express.static(frontendPath));

// ✅ SPA catch-all using regex (fixes path-to-regexp crash)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---------------- DB Connection ----------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 