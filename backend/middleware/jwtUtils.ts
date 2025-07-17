import jwt from 'jsonwebtoken';

/**
 * Checks if a JWT is within 5 minutes of expiration.
 * @param {string} token - The JWT string
 * @param {number} [windowSeconds=300] - The window in seconds (default: 5 minutes)
 * @returns {boolean} True if the token expires within the window, false otherwise
 */
export function isTokenExpiringSoon(token, windowSeconds = 300) {
  if (!token || typeof token !== 'string') return true;
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object' || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now <= windowSeconds;
  } catch (err) {
    return true; // treat as expiring if decode fails
  }
}
