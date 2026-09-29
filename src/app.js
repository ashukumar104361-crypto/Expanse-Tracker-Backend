const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // Adjust or configure as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root & API Landing Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teenager Expense Tracker API is active.',
    frontend_url: 'http://localhost:3000',
    documentation: 'See README.md for endpoint list'
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teenager Expense Tracker API root. Access endpoints like /api/auth, /api/expenses, /api/budgets.',
    frontend_url: 'http://localhost:3000',
    health_check: '/api/health'
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Teenager Expense Tracker API is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/categories', '/categories'], categoryRoutes);
app.use(['/api/expenses', '/expenses'], expenseRoutes);
app.use(['/api/budgets', '/budgets'], budgetRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/suggestions', '/suggestions'], suggestionRoutes);

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
