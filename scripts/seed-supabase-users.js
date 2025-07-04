#!/usr/bin/env node
/**
 * Unified Supabase Test User Seeder
 *
 * Usage:
 *   node scripts/seed-supabase-users.js --single
 *   node scripts/seed-supabase-users.js --all
 *   node scripts/seed-supabase-users.js --email <email>
 *
 * Options:
 *   --single         Seed the default integration test user (with registration/auth/JWT)
 *   --all            Seed all test users (admin/regular, just data seeding)
 *   --email <email>  Seed a specific user by email (with registration/auth/JWT)
 *
 * If no option is provided, defaults to --single.
 */

import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_JWT_SECRET) {
  console.error(
    'Missing SUPABASE_URL, SUPABASE_KEY, or SUPABASE_JWT_SECRET in env'
  );
  process.exit(1);
}

const DEFAULT_USER = {
  email: 'testuser+integration@example.com',
  password: 'TestPassword123!',
  label: 'Integration Test User',
};

const ALL_USERS = [
  {
    id: 'e250420b-c693-4ee8-83e6-f8269e6d4f93',
    email: 'mrbillwood@hotmail.com',
    label: 'Regular User',
  },
  {
    id: 'c90a5a82-30fb-41a9-a17f-8e1b5a75f176',
    email: 'mrbillwood@gmail.com',
    label: 'Admin User',
  },
];

const restHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates',
};

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--all')) return { mode: 'all' };
  if (args.includes('--single')) return { mode: 'single' };
  const emailIdx = args.indexOf('--email');
  if (emailIdx !== -1 && args[emailIdx + 1]) {
    return { mode: 'email', email: args[emailIdx + 1] };
  }
  return { mode: 'single' };
}

async function registerOrFetchUser(email, password) {
  let userId;
  try {
    const { data } = await axios.post(
      `${SUPABASE_URL}/auth/v1/signup`,
      { email, password },
      { headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' } }
    );
    userId = data.user?.id;
    if (userId) {
      console.log(`User registered: ${userId}`);
    } else {
      throw new Error('No user id returned');
    }
  } catch (err) {
    if (
      err.response &&
      err.response.data?.msg?.includes('User already registered')
    ) {
      console.log('User already exists, fetching user id...');
      if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.error(
          'User exists. Set SUPABASE_SERVICE_ROLE_KEY in env to fetch user id.'
        );
        process.exit(1);
      }
      const { data } = await axios.get(
        `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      userId = data.users?.[0]?.id;
      if (!userId) {
        console.error('Could not find user id for test user.');
        process.exit(1);
      }
      console.log('Fetched user id:', userId);
    } else {
      console.error('Error registering/fetching user:', err.message);
      process.exit(1);
    }
  }
  return userId;
}

function generateJwt(userId, email) {
  const payload = { sub: userId, email };
  return jwt.sign(payload, SUPABASE_JWT_SECRET, { expiresIn: '1h' });
}

async function seedUserData({ id, email, label }, opts = {}) {
  console.log(`\nSeeding data for ${label}: ${email}`);
  let userId = id;
  let jwtToken;
  if (opts.register) {
    userId = await registerOrFetchUser(email, opts.password);
    jwtToken = generateJwt(userId, email);
  }
  // Insert into prompt_logs
  const promptLogId = uuidv4();
  const promptLog = {
    id: promptLogId,
    user_id: userId,
    business_description: `Test business description for ${label}`.padEnd(
      20,
      '.'
    ),
    prompt_text: opts.promptText || 'Test prompt',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/prompt_logs`, [promptLog], {
      headers: restHeaders,
    });
    console.log('Inserted prompt_logs row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('prompt_logs row already exists.');
    } else {
      console.error('Error inserting prompt_logs:', err.message);
    }
  }
  // Insert into comparisons
  const comparison = {
    id: uuidv4(),
    prompt_log_id: promptLogId,
    user_id: userId,
    canai_output: `output1 for ${label}`,
    generic_output: `output2 for ${label}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/comparisons`, [comparison], {
      headers: restHeaders,
    });
    console.log('Inserted comparisons row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('comparisons row already exists.');
    } else {
      console.error('Error inserting comparisons:', err.message);
    }
  }
  // Insert into spark_logs
  const sparkLog = {
    id: uuidv4(),
    user_id: userId,
    is_public: true,
    generated_sparks: JSON.stringify(['Test Spark 1', 'Test Spark 2']),
    status: 'generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    await axios.post(`${SUPABASE_URL}/rest/v1/spark_logs`, [sparkLog], {
      headers: restHeaders,
    });
    console.log('Inserted spark_logs row.');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('spark_logs row already exists.');
    } else {
      console.error('Error inserting spark_logs:', err.message);
    }
  }
  if (opts.register) {
    console.log('TEST_USER_ID:', userId);
    console.log('TEST_USER_JWT:', jwtToken);
  }
}

async function main() {
  const { mode, email } = parseArgs();
  if (mode === 'all') {
    for (const user of ALL_USERS) {
      await seedUserData(user);
    }
    console.log('\nSeeding complete for all users!');
  } else if (mode === 'email') {
    await seedUserData(
      { email, label: 'Custom User' },
      { register: true, password: DEFAULT_USER.password }
    );
    console.log('\nSeeding complete for user:', email);
  } else {
    // Default: single
    await seedUserData(DEFAULT_USER, {
      register: true,
      password: DEFAULT_USER.password,
    });
    console.log('\nSeeding complete for default integration user!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
