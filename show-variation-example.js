// show-variation-example.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function showExample() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    // Get a few real records
    const samples = await db.collection('items').find({
      artistPopReport: { $exists: true, $ne: null }
    }).limit(5).toArray();
    
    samples.forEach((item, i) => {
      console.log(`\n=== Record ${i + 1} ===`);
      console.log('Artist:', item.artistPopReport);
      console.log('Album:', item.albumPopReport);
      console.log('Series (Media Type):', item.series);
      console.log('ItemType:', item.itemType);
      console.log('Variation:', item.variation);
      console.log('Grade:', item.masterGrade);
    });
    
  } finally {
    await client.close();
  }
}

showExample();