import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Environment variables with defaults
const config = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // MongoDB configuration
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kribi-port',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    },
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 30, // days
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '90d',
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    username: process.env.EMAIL_USERNAME || 'your_email_username',
    password: process.env.EMAIL_PASSWORD || 'your_email_password',
    from: process.env.EMAIL_FROM || 'noreply@kribiport.cm',
    fromName: process.env.EMAIL_FROM_NAME || 'Kribi Port Authority',
  },
  
  // File upload configuration
  uploads: {
    directory: process.env.UPLOAD_DIRECTORY || 'public/uploads',
    maxFileSize: process.env.MAX_FILE_UPLOAD || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  
  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || 'logs',
  },
  
  // API
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // Security
  security: {
    passwordSaltRounds: 10,
    resetPasswordExpiresIn: 10 * 60 * 1000, // 10 minutes
  },
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const checkRequiredEnvVars = () => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

// Check required environment variables in production
if (process.env.NODE_ENV === 'production') {
  checkRequiredEnvVars();
}

export default config;
