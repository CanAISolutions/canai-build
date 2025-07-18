/**
 * Centralized Logger Service
 * Re-exports the logger from the api directory for consistent imports across services
 */

import log from '../api/src/Shared/Logger.js';

export default log;
export { log as logger };
