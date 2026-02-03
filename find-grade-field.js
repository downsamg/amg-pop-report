// find-grade-field.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('All field names in first record:');
console.log(Object.keys(data[0]));

console.log('\n\nLooking for grade-related fields:');
Object.keys(data[0]).forEach(key => {
  if (key.toLowerCase().includes('grade')) {
    console.log(`${key}: ${data[0][key]}`);
  }
});

console.log('\n\nFull first record:');
console.log(JSON.stringify(data[0], null, 2));