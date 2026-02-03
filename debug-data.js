// debug-data.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log(`Total records: ${data.length}`);
console.log('\n--- First Record ---');
console.log(JSON.stringify(data[0], null, 2));

console.log('\n--- Field Analysis ---');
const firstRecord = data[0];

console.log('Artist_PopReport:', firstRecord.Artist_PopReport, typeof firstRecord.Artist_PopReport);
console.log('Album_PopReport:', firstRecord.Album_PopReport, typeof firstRecord.Album_PopReport);
console.log('Type_PopReport:', firstRecord.Type_PopReport, typeof firstRecord.Type_PopReport);
console.log('MasterGrade:', firstRecord.MasterGrade, typeof firstRecord.MasterGrade);

console.log('\n--- Sample of 5 records ---');
data.slice(0, 5).forEach((item, i) => {
  console.log(`\nRecord ${i + 1}:`);
  console.log(`  Artist: ${item.Artist_PopReport}`);
  console.log(`  Album: ${item.Album_PopReport}`);
  console.log(`  Type: ${item.Type_PopReport}`);
  console.log(`  Grade: ${item.MasterGrade}`);
});

console.log('\n--- Checking for valid records ---');
let validCount = 0;
let invalidReasons = {
  noArtistOrAlbum: 0,
  noGrade: 0,
  noItemType: 0
};

data.forEach(item => {
  const hasArtist = item.Artist_PopReport && item.Artist_PopReport !== '';
  const hasAlbum = item.Album_PopReport && item.Album_PopReport !== '';
  const hasGrade = item.MasterGrade && item.MasterGrade > 0;
  const hasItemType = item.Type_PopReport && item.Type_PopReport !== '' && item.Type_PopReport !== 'Unknown';
  
  if (!hasArtist && !hasAlbum) invalidReasons.noArtistOrAlbum++;
  if (!hasGrade) invalidReasons.noGrade++;
  if (!hasItemType) invalidReasons.noItemType++;
  
  if ((hasArtist || hasAlbum) && hasGrade && hasItemType) {
    validCount++;
  }
});

console.log(`Valid records: ${validCount}`);
console.log('Invalid reasons:');
console.log(`  Missing artist AND album: ${invalidReasons.noArtistOrAlbum}`);
console.log(`  Missing or invalid grade: ${invalidReasons.noGrade}`);
console.log(`  Missing or invalid item type: ${invalidReasons.noItemType}`);