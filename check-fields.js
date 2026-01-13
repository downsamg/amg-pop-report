require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkColumns() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    // Get one record and show ALL its fields
    const sample = await db.collection('items').findOne();
    
    console.log('Available fields in your data:');
    console.log(Object.keys(sample));
    
    console.log('\n\nFull sample record:');
    console.log(JSON.stringify(sample, null, 2));
    
  } finally {
    await client.close();
  }
}

checkColumns();