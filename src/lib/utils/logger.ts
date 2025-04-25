/**
 * Simple logger utility for development and debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Control which log levels show in the console
const LOG_LEVELS_ENABLED: Record<LogLevel, boolean> = {
  debug: process.env.NODE_ENV === 'development',
  info: true,
  warn: true,
  error: true
};

// Styling for different log levels
const LOG_STYLES: Record<LogLevel, string> = {
  debug: 'color: #888; font-weight: normal;',
  info: 'color: #0284c7; font-weight: bold;',
  warn: 'color: #f59e0b; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;'
};

// Create timestamp string
const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Log a message with specified level and context
 */
function log(level: LogLevel, message: string, context?: any): void {
  if (!LOG_LEVELS_ENABLED[level]) return;
  
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (typeof window !== 'undefined') {
    // Browser environment - use styled console logging
    console.log(`%c${prefix} ${message}`, LOG_STYLES[level]);
    if (context) console.log(context);
  } else {
    // Node.js environment - plain logging
    console.log(`${prefix} ${message}`);
    if (context) console.log(context);
  }
}

// Export logger methods
export const logger = {
  debug: (message: string, context?: any) => log('debug', message, context),
  info: (message: string, context?: any) => log('info', message, context),
  warn: (message: string, context?: any) => log('warn', message, context),
  error: (message: string, context?: any) => log('error', message, context),
};

// Pipeline logging
export function logProcessingStep(project: string, step: string, message: string): void {
  logger.info(`[Project ${project}] [${step}] ${message}`);
}

// Create a processing timer to track performance
export function createTimer(label: string) {
  const start = performance.now();
  return {
    stop: () => {
      const duration = Math.round(performance.now() - start);
      logger.debug(`${label} completed in ${duration}ms`);
      return duration;
    }
  };
}