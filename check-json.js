const fs = require('fs');

const filename = process.argv[2];

if (!filename) {
  console.error('❌ Please provide a JSON filename');
  console.log('Usage: node check-json.js your-new-data.json');
  process.exit(1);
}

const rawData = fs.readFileSync(filename, 'utf-8');
const data = JSON.parse(rawData);

console.log('📊 JSON File Analysis\n');
console.log(`Total records: ${data.length}\n`);
console.log('First record fields:');
console.log(JSON.stringify(data[0], null, 2));

console.log('\n\nAll unique field names in first record:');
console.log(Object.keys(data[0]).sort());