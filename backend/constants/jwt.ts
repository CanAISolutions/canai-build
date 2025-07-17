// Centralized JWT regex pattern for validation (shared constant)
// Matches three base64url segments separated by dots (standard JWT format)
// Example: header.payload.signature

const JWT_FORMAT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export { JWT_FORMAT_REGEX };
