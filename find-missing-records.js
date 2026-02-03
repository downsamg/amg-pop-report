// find-missing-records.js
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log(`Total records in file: ${data.length}`);

// Check what's being filtered out
let stats = {
  total: data.length,
  hasArtistOrAlbum: 0,
  hasGrade: 0,
  hasItemType: 0,
  passesAll: 0,
  failReasons: {
    noArtistOrAlbum: [],
    noGrade: [],
    noItemType: [],
    multiple: []
  }
};

data.forEach((item, index) => {
  const isValid = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };
  
  const hasArtist = isValid(item.Artist_PopReport);
  const hasAlbum = isValid(item.Album_PopReport);
  const hasArtistOrAlbum = hasArtist || hasAlbum;
  
  const hasGrade = item.Grade_PopReport !== null && 
                   item.Grade_PopReport !== undefined && 
                   item.Grade_PopReport >= 0 && 
                   item.Grade_PopReport <= 10;
  
  const hasItemType = isValid(item.Type_PopReport) && item.Type_PopReport !== 'Unknown';
  
  if (hasArtistOrAlbum) stats.hasArtistOrAlbum++;
  if (hasGrade) stats.hasGrade++;
  if (hasItemType) stats.hasItemType++;
  
  if (hasArtistOrAlbum && hasGrade && hasItemType) {
    stats.passesAll++;
  } else {
    // Track why it failed
    const reasons = [];
    if (!hasArtistOrAlbum) reasons.push('no artist/album');
    if (!hasGrade) reasons.push('no grade');
    if (!hasItemType) reasons.push('no itemtype');
    
    if (reasons.length === 1) {
      if (!hasArtistOrAlbum) stats.failReasons.noArtistOrAlbum.push(index);
      if (!hasGrade) stats.failReasons.noGrade.push(index);
      if (!hasItemType) stats.failReasons.noItemType.push(index);
    } else {
      stats.failReasons.multiple.push({ index, reasons, item: {
        artist: item.Artist_PopReport,
        album: item.Album_PopReport,
        grade: item.Grade_PopReport,
        type: item.Type_PopReport
      }});
    }
  }
});

console.log('\n--- Statistics ---');
console.log(`Records with artist or album: ${stats.hasArtistOrAlbum}`);
console.log(`Records with valid grade: ${stats.hasGrade}`);
console.log(`Records with valid item type: ${stats.hasItemType}`);
console.log(`Records passing all filters: ${stats.passesAll}`);
console.log(`Records filtered out: ${stats.total - stats.passesAll}`);

console.log('\n--- Why records fail ---');
console.log(`Missing artist AND album only: ${stats.failReasons.noArtistOrAlbum.length}`);
console.log(`Missing grade only: ${stats.failReasons.noGrade.length}`);
console.log(`Missing/invalid item type only: ${stats.failReasons.noItemType.length}`);
console.log(`Multiple reasons: ${stats.failReasons.multiple.length}`);

// Show some examples of failed records
if (stats.failReasons.noGrade.length > 0) {
  console.log('\n--- Sample records missing grade ---');
  stats.failReasons.noGrade.slice(0, 5).forEach(idx => {
    console.log(`Record ${idx}:`, {
      artist: data[idx].Artist_PopReport,
      album: data[idx].Album_PopReport,
      grade: data[idx].Grade_PopReport,
      type: data[idx].Type_PopReport
    });
  });
}

if (stats.failReasons.noItemType.length > 0) {
  console.log('\n--- Sample records missing item type ---');
  stats.failReasons.noItemType.slice(0, 5).forEach(idx => {
    console.log(`Record ${idx}:`, {
      artist: data[idx].Artist_PopReport,
      album: data[idx].Album_PopReport,
      grade: data[idx].Grade_PopReport,
      type: data[idx].Type_PopReport
    });
  });
}

if (stats.failReasons.multiple.length > 0) {
  console.log('\n--- Sample records with multiple issues ---');
  stats.failReasons.multiple.slice(0, 5).forEach(rec => {
    console.log(`Record ${rec.index}:`, rec.reasons.join(', '));
    console.log('  ', rec.item);
  });
}

// Find records with grade = 0
const authenticRecords = data.filter(item => item.Grade_PopReport === 0);
console.log(`\n--- Records with grade 0 (Authentic) ---`);
console.log(`Total Authentic records: ${authenticRecords.length}`);
console.log('First 3 Authentic records:');
authenticRecords.slice(0, 3).forEach(item => {
  console.log({
    artist: item.Artist_PopReport,
    album: item.Album_PopReport,
    grade: item.Grade_PopReport,
    type: item.Type_PopReport
  });
});