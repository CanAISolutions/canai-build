import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// PRD Alignment: Enforces authentication in production (F2: Discovery Funnel, F4: Purchase Flow, F5: Input Collection)
// - Only allows authenticated users in production
// - Allows all requests in non-production for testing
// - Uses Memberstack JWTs and JWKS for verification

const MEMBERSTACK_JWKS_URI =
  process.env.MEMBERSTACK_JWKS_URI || 'https://api.memberstack.com/v1/jwks';
const NODE_ENV = process.env.NODE_ENV || 'development';

const client = jwksClient({
  jwksUri: MEMBERSTACK_JWKS_URI,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

export default function auth(req, res, next) {
  if (NODE_ENV !== 'production') {
    // Non-production: allow all requests for testing
    return next();
  }

  // Production: enforce Memberstack authentication
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      audience: process.env.MEMBERSTACK_AUDIENCE || undefined, // Set if required
      issuer:
        process.env.MEMBERSTACK_ISSUER || 'https://api.memberstack.com/v1',
    },
    (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: 'Invalid or expired token', details: err.message });
      }
      // Attach user info to request for downstream use
      req.user = decoded;
      return next();
    }
  );
}


