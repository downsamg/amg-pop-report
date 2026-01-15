// test-itemtypes.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testItemTypes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    // Get distinct itemTypes
    const types = await db.collection('items').distinct('itemType');
    console.log('Available itemTypes:', types);
    
    // Count each type
    for (const type of types) {
      const count = await db.collection('items').countDocuments({ itemType: type });
      console.log(`  ${type}: ${count} records`);
    }
    
    // Show sample record
    const sample = await db.collection('items').findOne({ itemType: { $exists: true } });
    console.log('\nSample record:');
    console.log({
      artist: sample.artistPopReport,
      album: sample.albumPopReport,
      series: sample.series,
      itemType: sample.itemType,
      grade: sample.masterGrade
    });
    
  } finally {
    await client.close();
  }
}

testItemTypes();
