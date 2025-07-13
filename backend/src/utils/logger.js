import morgan from 'morgan';
import chalk from 'chalk';

// Custom token for request body (for logging POST/PUT data)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom token for colored status
morgan.token('status-colored', (req, res) => {
  // Get the status code
  const status = res.statusCode;
  
  // Get the status category
  const s = status / 100 | 0;
  
  // Color the status code based on the response status
  const color = s >= 5 ? 31 // red for server errors
    : s >= 4 ? 33 // yellow for client errors
    : s >= 3 ? 36 // cyan for redirects
    : s >= 2 ? 32 // green for success
    : 0; // no color for other
  
  return `\x1b[${color}m${status}\x1b[0m`;
});

// Custom token for colored method
morgan.token('method-colored', (req) => {
  const method = req.method;
  
  // Color the method based on the HTTP method
  let color;
  switch (method) {
    case 'GET':
      color = '\x1b[32m'; // green
      break;
    case 'POST':
      color = '\x1b[34m'; // blue
      break;
    case 'PUT':
      color = '\x1b[33m'; // yellow
      break;
    case 'DELETE':
      color = '\x1b[31m'; // red
      break;
    default:
      color = '\x1b[0m'; // default
  }
  
  return `${color}${method}\x1b[0m`;
});

// Custom format for development
const devFormat = ':method-colored :url :status-colored :response-time ms - :res[content-length] :body';

// Custom format for production (no colors, more compact)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Development logger
const devLogger = morgan(devFormat, {
  skip: (req, res) => process.env.NODE_ENV === 'test' || req.originalUrl === '/health',
  stream: process.stdout,
});

// Production logger
const prodLogger = morgan(prodFormat, {
  skip: (req, res) => req.originalUrl === '/health',
  stream: process.stdout,
});

// Error logger (for logging errors)
const errorLogger = (err, req, res, next) => {
  console.error(chalk.red('Error:'), err.stack);
  next(err);
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  // Log request details
  if (process.env.NODE_ENV === 'development') {
    console.log('\n--- New Request ---');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    
    // Log request headers in development
    if (process.env.DEBUG === 'true') {
      console.log('Headers:', req.headers);
      if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
      }
      if (req.query && Object.keys(req.query).length > 0) {
        console.log('Query:', req.query);
      }
      if (req.params && Object.keys(req.params).length > 0) {
        console.log('Params:', req.params);
      }
    }
  }
  
  next();
};

export { devLogger, prodLogger, errorLogger, requestLogger };

// Example usage in server.js:
// import { devLogger, prodLogger, errorLogger, requestLogger } from './utils/logger';
// 
// // Request logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(devLogger);
// } else {
//   app.use(prodLogger);
// }
// 
// // Error logging
// app.use(errorLogger);
// 
// // Request details logging (for debugging)
// if (process.env.NODE_ENV === 'development') {
//   app.use(requestLogger);
// }
