require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// ========================
// Middleware
// ========================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========================
// Swagger Documentation
// ========================
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'A2R Demo API',
        version: '1.0.0',
        description: 'Blood Bank Management System API Documentation',
        contact: {
          name: 'A2R Demo',
          email: 'support@a2r-demo.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ========================
// API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'A2R Demo API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ================================================
  🩸 A2R Demo Server
  ================================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port:        ${PORT}
  API Docs:    http://localhost:${PORT}/api-docs
  Health:      http://localhost:${PORT}/api/health
  ================================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app; // Export for testing
