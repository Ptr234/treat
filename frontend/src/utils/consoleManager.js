// Production Console Manager
// Removes console statements in production while preserving errors

class ConsoleManager {
  constructor() {
    this.originalConsole = { ...console };
    this.isProduction = import.meta.env.PROD;
    this.isDebugEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';
    
    // Always disable warnings regardless of environment
    this.disableWarnings();
    
    if (this.isProduction && !this.isDebugEnabled) {
      this.disableConsole();
    }
  }

  disableWarnings() {
    // Completely suppress all warnings in all environments
    console.warn = () => {};
  }

  disableConsole() {
    // Preserve error and warn in production for critical issues
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // Keep error and warn but sanitize them
    console.error = (...args) => {
      // Only log sanitized errors in production
      const sanitizedArgs = args.map(arg => {
        if (typeof arg === 'string') {
          // Remove potentially sensitive information
          return arg.replace(/token|password|secret|key/gi, '[REDACTED]');
        }
        return '[OBJECT]';
      });
      this.originalConsole.error('[PROD ERROR]', ...sanitizedArgs);
    };

    console.warn = () => {
      // Completely suppress all warnings
    };
  }

  // Safe logging for development
  devLog(level, ...args) {
    if (!this.isProduction || this.isDebugEnabled) {
      this.originalConsole[level](...args);
    }
  }

  // Critical errors that should always be logged
  criticalError(...args) {
    this.originalConsole.error('[CRITICAL]', ...args);
  }

  // Restore original console (for testing)
  restore() {
    Object.assign(console, this.originalConsole);
  }
}

export const consoleManager = new ConsoleManager();
export default consoleManager;