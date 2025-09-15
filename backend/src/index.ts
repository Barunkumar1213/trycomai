import 'module-alias/register';
import 'dotenv/config';
import App from './app';

// Initialize the application
const app = new App();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Start the server
app.start(PORT).catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider logging the error to an error tracking service here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Consider logging the error to an error tracking service here
  process.exit(1);
});

// Handle SIGTERM signal for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});
