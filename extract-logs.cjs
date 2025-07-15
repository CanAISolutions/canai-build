const fs = require('fs');
const path = require('path');

const LOG_TAGS = [
  '[VALIDATION',
  '[ROUTE',
  '[MOCK',
  '[GPT RAW RESPONSE]',
  '[VALIDATION ERROR]',
  '[TEST',
  '[sanitize]',
  // Add more tags as needed
];

const xmlPath = path.resolve(__dirname, 'test-results.xml');
if (!fs.existsSync(xmlPath)) {
  console.error('test-results.xml not found in project root.');
  process.exit(1);
}
const xml = fs.readFileSync(xmlPath, 'utf8');

const lines = xml.split('\n');
const matches = lines.filter(line => LOG_TAGS.some(tag => line.includes(tag)));

console.log('--- Extracted Key Logs ---');
matches.forEach(line => console.log(line.trim()));
console.log('--- End of Extracted Logs ---');
