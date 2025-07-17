#!/usr/bin/env node
// backend/scripts/test-gpt4o.js
// Usage: node backend/scripts/test-gpt4o.js --prompt "Say hello"
// Description: CLI tool to test GPT4Service initialization and OpenAI GPT-4o prompt execution.

import { GPT4Service } from '../services/gpt4o.js';
import * as Sentry from '@sentry/node';

// Parse command line arguments
const args = process.argv.slice(2);
let prompt = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--prompt' && args[i + 1]) {
    prompt = args[i + 1];
    break;
  }
}

if (!prompt) {
  console.error(
    'Usage: node backend/scripts/test-gpt4o.js --prompt "Your prompt here"'
  );
  process.exit(1);
}

(async () => {
  const service = new GPT4Service();
  await service.initialize();

  // Test getParameters for each prompt type
  const types = [
    'business_plan',
    'social_media',
    'website_audit',
    'unknown_type',
  ];
  for (const type of types) {
    try {
      const params = await service.getParameters(type);
      console.log(`Params for "${type}":`, params);
    } catch (err) {
      console.error(`Error for "${type}":`, err.message);
    }
  }

  try {
    console.log('✅ GPT4Service initialized successfully.');
    // Send prompt to OpenAI
    const response = await service.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });
    console.log('--- OpenAI GPT-4o Response ---');
    console.log(response.choices[0].message.content);
  } catch (err) {
    Sentry.captureException(err);
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
