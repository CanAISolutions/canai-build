// Generate a JWT for the test user using the Supabase JWT secret from .env
// Usage: node scripts/generate-test-user-jwt.js

import 'dotenv/config';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
if (!SUPABASE_JWT_SECRET) {
  console.error('Missing SUPABASE_JWT_SECRET in .env');
  process.exit(1);
}

const payload = {
  sub: 'e250420b-c693-4ee8-83e6-f8269e6d4f93',
  email: 'mrbillwood@gmail.com',
};

const token = jwt.sign(payload, SUPABASE_JWT_SECRET, { expiresIn: '1h' });
console.log('Generated JWT for test user:');
console.log(token);
