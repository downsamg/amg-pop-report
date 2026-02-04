require('dotenv').config();
const { MongoClient } = require('mongodb');

async function removeBadImport() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('grading_db');
    const collection = db.collection('items');

    // Find records with null masterGrade but valid artistPopReport
    const result = await collection.deleteMany({
      masterGrade: null,
      artistPopReport: { $ne: null }
    });

    console.log(`🗑️  Removed ${result.deletedCount} records with null masterGrade`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

removeBadImport();