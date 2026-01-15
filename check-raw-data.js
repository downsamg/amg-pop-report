// check-raw-data.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log('First record keys:');
console.log(Object.keys(data[0]));

console.log('\n\nFirst record sample:');
console.log(JSON.stringify(data[0], null, 2));

console.log('\n\nChecking type_PopReport field:');
console.log('type_PopReport value:', data[0].type_PopReport);

// Check if any records have type_PopReport
const withType = data.filter(item => item.type_PopReport && item.type_PopReport !== '');
console.log(`\nRecords with type_PopReport: ${withType.length} out of ${data.length}`);

if (withType.length > 0) {
  console.log('\nSample type_PopReport values:');
  const uniqueTypes = [...new Set(withType.map(item => item.type_PopReport))];
  console.log(uniqueTypes);
}
