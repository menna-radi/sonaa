import { ENV } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS: Record<LogLevel, string> = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[90m',  // gray
};
const RESET = '\x1b[0m';

function log(level: LogLevel, ...args: unknown[]): void {
  if (!ENV.IS_DEV) return; // silent in production
  const prefix = `${COLORS[level]}[${level.toUpperCase()}]${RESET}`;
  console[level === 'debug' ? 'log' : level](prefix, ...args);
}

/**
 * App-wide logger.
 * - Development: prints everything with color-coded prefixes.
 * - Production:  silent (no console.log leaks).
 *
 * To wire in a remote logging service (e.g. Sentry), replace the
 * production branch in each method.
 */
export const logger = {
  info:  (...args: unknown[]) => log('info',  ...args),
  warn:  (...args: unknown[]) => log('warn',  ...args),
  error: (...args: unknown[]) => log('error', ...args),
  debug: (...args: unknown[]) => log('debug', ...args),
};
