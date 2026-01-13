require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔄 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('grading_db');
    const count = await db.collection('items').countDocuments();
    console.log(`📊 Total items: ${count}`);
    
    // Test the actual query
    const testArtist = await db.collection('items').findOne({
      Artist_PopReport: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log('\nSample record with Artist_PopReport:');
    console.log('Artist:', testArtist?.Artist_PopReport);
    console.log('Album:', testArtist?.Album_PopReport);
    console.log('Grade:', testArtist?.MasterGrade);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

testConnection();