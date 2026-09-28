const app = require('./app');
const config = require('./config/env');

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Teenager Expense Tracker API is running on port ${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment:  ${config.nodeEnv}`);
  console.log(`=======================================================`);
});

// Graceful error handling for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection! Shutting down server gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});
