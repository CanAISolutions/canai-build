/**
 * Centralized Logger Service
 * Re-exports the logger from the Shared directory for consistent imports across services
 */
import log from '../Shared/Logger.js';

export { log as logger };
