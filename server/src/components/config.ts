import path from 'path';
import fs from 'fs';
import { config as dotenvConfig } from 'dotenv';
import { createLogger, format, transports, Logger } from 'winston';
import OpenAI from 'openai';
import { APIKeys } from './types/localTypes';

// Load environment variables from `.env` file
dotenvConfig();

// Constants
const isDevelopment = process.env.FLASK_ENV === 'development';
const DATA_DIR = isDevelopment ? 'data' : './components/data';
const UPLOAD_FOLDER = path.join(DATA_DIR, 'uploads');
const ALLOWED_EXTENSIONS = new Set(['pdf']);
const USAGE_LOG_PATH = path.join(DATA_DIR, 'usage.log');

// Environment setup
process.env.NUMEXPR_MAX_THREADS = '8';
process.env.OPENAI_API_TYPE = 'azure';
process.env.OPENAI_API_BASE = process.env.AZURE_OPENAI_ENDPOINT || '';
process.env.OPENAI_API_KEY = process.env.AZURE_OPENAI_KEY || '';
process.env.OPENAI_API_VERSION = '2024-08-01-preview';


const apiKeys : APIKeys = {
  NUMEXPR_MAX_THREADS: 8,
  OpenAI_API_TYPE: 'azure',
  OpenAI_API_BASE: process.env.AZURE_OPENAI_ENDPOINT || '',
  OpenAI_API_KEY: process.env.AZURE_OPENAI_KEY || '',
  OpenAI_API_VERSION: '2024-08-01-preview',
}

// Set timezone for the Node.js runtime
if (!isDevelopment) {
  process.env.TZ = 'US/Pacific';
  try {
    // Set timezone explicitly if necessary for the Node.js runtime
    require('timezonecomplete');
  } catch (e) {
    console.warn('timezonecomplete module not found. TZ might not behave as expected.');
  }
}

// Helper function: Secure filename (mimics `werkzeug.utils.secure_filename`)
export const secureFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
};

// Logger setup
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()}: ${message}`)),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Add file transport for development
if (isDevelopment) {
  logger.add(
    new transports.File({
      filename: 'app.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
  );
}

// Usage Logger
const usageLogger: Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.printf(({ timestamp, message }) => `${timestamp} ${message}`)),
  transports: [
    new transports.File({
      filename: USAGE_LOG_PATH,
      format: format.combine(format.timestamp(), format.simple()),
    }),
  ],
});

// Create upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Export configuration
export {
  isDevelopment,
  DATA_DIR,
  UPLOAD_FOLDER,
  ALLOWED_EXTENSIONS,
  logger,
  usageLogger,
  apiKeys
};