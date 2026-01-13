// test-toyseries.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testToySeries() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    const sample = await db.collection('items').findOne({
      ToySeries: { $exists: true }
    });
    
    console.log('Sample ToySeries value:', sample?.ToySeries);
    
    const seriesCount = await db.collection('items').countDocuments({
      ToySeries: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`Records with ToySeries: ${seriesCount}`);
    
  } finally {
    await client.close();
  }
}

testToySeries();