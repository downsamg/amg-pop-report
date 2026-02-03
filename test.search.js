// test-search.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testSearch() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    const count = await db.collection('items').countDocuments();
    console.log(`Total records: ${count}`);
    
    // Test a specific search
    const sample = await db.collection('items').findOne({
      artistPopReport: /2pac/i
    });
    
    console.log('\nSample 2Pac record:');
    console.log(JSON.stringify(sample, null, 2));
    
    // Check grades
    const grades = await db.collection('items').distinct('masterGrade');
    console.log('\nAll grades in database:', grades.sort((a,b) => a-b));
    
  } finally {
    await client.close();
  }
}

testSearch();