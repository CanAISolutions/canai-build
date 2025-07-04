/* eslint-disable @typescript-eslint/no-var-requires */
import { PostHog } from 'posthog-node';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid'; // For anonymous user/session IDs

// --- Analytics State ---
let posthog = null;
let trackFunnelStep = null;
let trackApiLatency = null;
let trackErrorOccurred = null;
let trackUserAction = null;
let safeCapture = null;
let validateEvent = null;
let enrichWithSession = null;
let scrubPII = null;

// --- Env-derived constants (set in initPosthog) ---
let SESSION_TIMEOUT_MINUTES = 30;
let APP_VERSION = '0.0.0';
let APP_ENV = 'development';
let DEPLOYMENT_ID = 'unknown';

// --- Session State Management ---
const sessionStore = {};

const getSession = sessionId => {
  const session = sessionStore[sessionId];
  if (!session) return null;
  if (session.ended) return null;
  const now = Date.now();
  if (now - session.lastActive > SESSION_TIMEOUT_MINUTES * 60 * 1000) {
    endSession(sessionId);
    return null;
  }
  return session;
};

const startSession = user => {
  const sessionId = uuidv4();
  const now = Date.now();
  sessionStore[sessionId] = {
    sessionId,
    userId: user && user.id ? user.id : getOrCreateAnonymousId(),
    isAnonymous: !(user && user.id),
    deviceInfo: user && user.deviceInfo ? user.deviceInfo : {},
    startTime: now,
    lastActive: now,
    ended: false,
  };
  // Track session_start event
  trackSessionEvent('session_start', sessionStore[sessionId]);
  return sessionStore[sessionId];
};

const endSession = sessionId => {
  const session = sessionStore[sessionId];
  if (session && !session.ended) {
    session.ended = true;
    session.endTime = Date.now();
    session.duration = (session.endTime - session.startTime) / 1000; // seconds
    // Track session_end event
    trackSessionEvent('session_end', session);
    // Optionally: clean up sessionStore[sessionId] after a delay
    setTimeout(() => {
      delete sessionStore[sessionId];
    }, 60 * 1000);
  }
};

function updateSessionActivity(sessionId) {
  const session = sessionStore[sessionId];
  if (session && !session.ended) {
    session.lastActive = Date.now();
  }
}

function trackSessionEvent(eventType, session) {
  const event = {
    eventType,
    sessionId: session.sessionId,
    userId: session.userId,
    isAnonymous: session.isAnonymous,
    deviceInfo: scrubPII ? scrubPII(session.deviceInfo) : {},
    timestamp: new Date().toISOString(),
    ...(eventType === 'session_end' && session.duration
      ? { duration: session.duration }
      : {}),
  };
  if (safeCapture) safeCapture(event);
}

// --- User/Session Identification ---
function getOrCreateAnonymousId() {
  if (process.env.NODE_ENV === 'test') return 'test-anonymous-id';
  if (!global.__ANON_ID) {
    global.__ANON_ID = uuidv4();
  }
  return global.__ANON_ID;
}

function buildUserContext(user) {
  if (user && user.id) {
    return {
      userId: user.id,
      role: user.role || 'user',
      deviceInfo: user.deviceInfo || {},
      sessionId: user.sessionId || uuidv4(),
      isAnonymous: false,
    };
  }
  return {
    userId: getOrCreateAnonymousId(),
    role: 'anonymous',
    deviceInfo: {},
    sessionId: getOrCreateAnonymousId(),
    isAnonymous: true,
  };
}

// --- Event Schemas ---
const funnelStepSchema = Joi.object({
  stepName: Joi.string().required(),
  sessionId: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  deviceInfo: Joi.object().optional(),
  properties: Joi.object().optional(),
}).unknown(true);
const apiLatencySchema = Joi.object({
  endpoint: Joi.string().required(),
  duration: Joi.number().required(),
  status: Joi.number().required(),
  sessionId: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  deviceInfo: Joi.object().optional(),
}).unknown(true);
const errorOccurredSchema = Joi.object({
  errorType: Joi.string().required(),
  stackTrace: Joi.string().optional(),
  context: Joi.object().optional(),
  sessionId: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  deviceInfo: Joi.object().optional(),
}).unknown(true);
const userActionSchema = Joi.object({
  actionType: Joi.string().required(),
  element: Joi.string().optional(),
  pageContext: Joi.object().optional(),
  sessionId: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  deviceInfo: Joi.object().optional(),
}).unknown(true);

// --- PostHog Initialization ---
export function initPosthog() {
  const envSchema = Joi.object({
    POSTHOG_API_KEY: Joi.string().min(1).required(),
    POSTHOG_HOST: Joi.string().uri().default('https://app.posthog.com'),
    POSTHOG_FLUSH_AT: Joi.number().integer().min(1).default(20),
    POSTHOG_FLUSH_INTERVAL: Joi.number().integer().min(1).default(30000),
    SESSION_TIMEOUT_MINUTES: Joi.number().integer().min(1).default(30),
    DEPLOYMENT_ID: Joi.string().optional(),
  }).unknown();
  const { error: envError, value: envVars } = envSchema.validate(process.env, {
    abortEarly: false,
  });
  if (envError) {
    console.error('[PostHog] Environment variable validation failed:');
    envError.details.forEach(d => {
      if (d.path[0] === 'POSTHOG_API_KEY') {
        console.error(
          `  - ${d.message.replace(/"POSTHOG_API_KEY".*/, 'POSTHOG_API_KEY is required and must be a non-empty string.')}`
        );
      } else {
        console.error(`  - ${d.message}`);
      }
    });
    console.error(
      '[PostHog] Analytics will be disabled due to invalid configuration.'
    );
    throw new Error('Invalid PostHog configuration');
  }
  const POSTHOG_API_KEY = envVars.POSTHOG_API_KEY;
  if (!POSTHOG_API_KEY) throw new Error('POSTHOG_API_KEY is required');
  const POSTHOG_HOST = envVars.POSTHOG_HOST;
  const FLUSH_AT = envVars.POSTHOG_FLUSH_AT;
  const FLUSH_INTERVAL = envVars.POSTHOG_FLUSH_INTERVAL || 30000;
  SESSION_TIMEOUT_MINUTES = envVars.SESSION_TIMEOUT_MINUTES;
  DEPLOYMENT_ID =
    envVars.DEPLOYMENT_ID || process.env.DEPLOYMENT_ID || 'unknown';
  APP_VERSION = process.env.npm_package_version || '0.0.0';
  APP_ENV = process.env.NODE_ENV || 'development';
  posthog = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    flushAt: FLUSH_AT,
    flushInterval: FLUSH_INTERVAL,
  });

  // Connection validation
  (async () => {
    try {
      await posthog.capture({
        distinctId: 'system',
        event: 'posthog_startup_health_check',
        properties: { timestamp: new Date().toISOString() },
      });
      console.log('[PostHog] Connection validated. Analytics enabled.');
    } catch (err) {
      console.error('[PostHog] Connection validation failed:', err);
    }
  })();

  // SIGTERM shutdown handler
  process.on('SIGTERM', async () => {
    try {
      await posthog.shutdown();
      console.log('[PostHog] Analytics queue flushed and connection closed.');
    } catch (err) {
      console.error('[PostHog] Error during shutdown:', err);
    }
  });

  safeCapture = async function safeCapture(event, attempts = 3) {
    try {
      await posthog.capture(event);
    } catch (err) {
      console.error('[PostHog] Event capture failed, retrying:', err);
      if (attempts > 1) {
        await new Promise(res => setTimeout(res, 1000 * (4 - attempts)));
        await safeCapture(event, attempts - 1);
      } else {
        console.error('[PostHog] Event capture failed after retries:', err);
      }
    }
  };
  scrubPII = obj => {
    if (!obj) return obj;
    const scrubbed = { ...obj };
    delete scrubbed.email;
    delete scrubbed.name;
    delete scrubbed.phone;
    delete scrubbed.userId;
    return scrubbed;
  };
  validateEvent = (eventType, properties) => {
    const eventSchemas = {
      funnel_step: funnelStepSchema,
      api_latency: apiLatencySchema,
      error_occurred: errorOccurredSchema,
      user_action: userActionSchema,
    };
    const schema = eventSchemas[eventType];
    if (!schema) return { error: null };
    const result = schema.validate(properties);
    return { error: result.error || null };
  };
  enrichWithSession = (event, sessionId) => {
    const session = getSession(sessionId);
    return {
      ...event,
      ...(session
        ? {
            sessionStart: new Date(session.startTime).toISOString(),
            lastActive: new Date(session.lastActive).toISOString(),
            ...(session.duration ? { sessionDuration: session.duration } : {}),
            isAnonymous: session.isAnonymous,
            userId: session.userId,
          }
        : {}),
      appVersion: APP_VERSION,
      environment: APP_ENV,
      deploymentId: DEPLOYMENT_ID,
    };
  };
  trackFunnelStep = (stepName, session, properties = {}) => {
    updateSessionActivity(session.sessionId);
    const event = enrichWithSession(
      {
        stepName,
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
        deviceInfo: scrubPII(session.deviceInfo),
        properties: scrubPII(properties),
      },
      session.sessionId
    );
    const { error } = validateEvent('funnel_step', event);
    if (error) {
      console.error('[PostHog] Invalid funnel_step event:', error.message);
      return;
    }
    safeCapture({ event: 'funnel_step', properties: event });
  };
  trackApiLatency = (endpoint, duration, status, session) => {
    updateSessionActivity(session.sessionId);
    const event = enrichWithSession(
      {
        endpoint,
        duration,
        status,
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
        deviceInfo: scrubPII(session.deviceInfo),
      },
      session.sessionId
    );
    const { error } = validateEvent('api_latency', event);
    if (error) {
      console.error('[PostHog] Invalid api_latency event:', error.message);
      return;
    }
    safeCapture({ event: 'api_latency', properties: event });
  };
  trackErrorOccurred = (errorType, stackTrace, context, session) => {
    updateSessionActivity(session.sessionId);
    const event = enrichWithSession(
      {
        errorType,
        stackTrace,
        context: scrubPII(context),
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
        deviceInfo: scrubPII(session.deviceInfo),
      },
      session.sessionId
    );
    const { error } = validateEvent('error_occurred', event);
    if (error) {
      console.error('[PostHog] Invalid error_occurred event:', error.message);
      return;
    }
    safeCapture({ event: 'error_occurred', properties: event });
  };
  trackUserAction = (actionType, element, pageContext, session) => {
    updateSessionActivity(session.sessionId);
    const event = enrichWithSession(
      {
        actionType,
        element,
        pageContext: scrubPII(pageContext),
        sessionId: session.sessionId,
        timestamp: new Date().toISOString(),
        deviceInfo: scrubPII(session.deviceInfo),
      },
      session.sessionId
    );
    const { error } = validateEvent('user_action', event);
    if (error) {
      console.error('[PostHog] Invalid user_action event:', error.message);
      return;
    }
    safeCapture({ event: 'user_action', properties: event });
  };
}

const posthogDefault = {
  capture: (...args) => safeCapture && safeCapture(...args),
};
export default posthogDefault;

export {
  posthog,
  trackFunnelStep,
  trackApiLatency,
  trackErrorOccurred,
  trackUserAction,
  startSession,
  endSession,
  getSession,
  validateEvent,
  scrubPII,
  enrichWithSession,
  safeCapture,
  sessionStore,
};
