// Generate a JWT for the admin user using the Supabase JWT secret from .env
// Usage: node scripts/generate-admin-user-jwt.js

import 'dotenv/config';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
if (!SUPABASE_JWT_SECRET) {
  console.error('Missing SUPABASE_JWT_SECRET in .env');
  process.exit(1);
}

const payload = {
  sub: 'c90a5a82-30fb-41a9-a17f-8e1b5a75f176',
  email: 'mrbillwood@gmail.com',
  role: 'admin', // Add admin role claim
};

const token = jwt.sign(payload, SUPABASE_JWT_SECRET, { expiresIn: '1h' });
console.log('Generated JWT for admin user:');
console.log(token);
