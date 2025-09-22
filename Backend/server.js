const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const chefRoutes = require('./routes/chef.routes');
const bookingRoutes = require('./routes/booking.routes');
const cuisineRoutes = require('./routes/cuisine.routes');
const contactRoutes = require('./routes/contact.routes');

// Import error middleware
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com'
        : 'http://localhost:5000',
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chefs', chefRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/contact', contactRoutes);

// ✅ Health check routes (must be before errorHandler & app.listen)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/health/detailed', (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    const systemInfo = {
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        unit: 'MB',
      },
      uptime: {
        seconds: Math.round(process.uptime()),
      },
      nodeVersion: process.version,
      platform: process.platform,
    };

    res.status(200).json({
      status: 'UP',
      timestamp: new Date(),
      database: {
        status: dbStatus,
        name: 'MongoDB',
        host: mongoose.connection.host,
      },
      system: systemInfo,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      error: error.message,
    });
  }
});

// Error handling middleware (must come after routes)
app.use(errorHandler);

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/chefconnect',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
