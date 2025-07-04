#!/usr/bin/env node

console.log('🔄 Converting YAML tasks via TaskMaster API...');

// Sample tasks from your YAML format
const sampleTasks = [
  {
    id: 'T6.1.1-messages-api',
    description:
      'Implement GET /v1/messages API to fetch trust indicators with caching and stats',
    dependencies: ['T8.2.1-supabase-schema'],
    instructions: [
      'Create Express route for GET /v1/messages',
      'Integrate Supabase client to query trust_indicators',
      'Calculate stats (SELECT COUNT(*) FROM comparisons WHERE created_at IS NOT NULL)',
      'Implement caching with node-cache',
      'Log funnel_step event with PostHog',
    ],
  },
  {
    id: 'T6.1.2-log-interaction',
    description:
      'Implement POST /v1/log-interaction API and Make.com webhook for interaction logging',
    dependencies: ['T6.1.1-messages-api', 'T8.3.2-makecom-other-scenarios'],
    instructions: [
      'Create Express route for POST /v1/log-interaction',
      'Validate request with Joi (interaction_type, details)',
      'Store logs in Supabase session_logs',
      'Set up Make.com webhook handler',
      'Log pricing_modal_viewed event with PostHog',
    ],
  },
];

function createTaskPrompt(task) {
  const details = task.instructions.join('\n- ');
  return `Task: ${task.description}

Implementation steps:
- ${details}

Original ID: ${task.id}
Dependencies: ${task.dependencies.join(', ')}`;
}

console.log('Sample task prompts that would be sent to TaskMaster:');
console.log('='.repeat(60));

sampleTasks.forEach((task, index) => {
  console.log(`\nTask ${index + 1}:`);
  console.log(createTaskPrompt(task));
  console.log('-'.repeat(40));
});

console.log('\n✅ Sample conversion completed!');
console.log('\nTo actually convert your tasks:');
console.log('1. Use TaskMaster MCP tools with the prompts above');
console.log('2. Or run: task-master add-task --prompt="<prompt text>"');
console.log('3. Then set up dependencies with: task-master add-dependency');
