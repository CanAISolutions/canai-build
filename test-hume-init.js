import HumeService from './backend/services/hume.js';

const hume = new HumeService();

console.log('Starting HumeService initialization...');
hume
  .initialize()
  .then(() => {
    console.log('HumeService initialized successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error during HumeService initialization:', err);
    process.exit(1);
  });
