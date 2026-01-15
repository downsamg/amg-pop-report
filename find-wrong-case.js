require('dotenv').config();
const { MongoClient } = require('mongodb');

async function findWrongCase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    const collection = db.collection('items');
    
    // Find lowercase 'open'
    console.log('🔍 Finding records with lowercase "open":');
    const openRecords = await collection.find({ itemType: 'open' }).toArray();
    console.log(`Found ${openRecords.length} records with "open"`);
    
    openRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. ID: ${record._id}`);
      console.log(`   Artist: ${record.artistPopReport}`);
      console.log(`   Album: ${record.albumPopReport}`);
      console.log(`   HoloID: ${record.holoID}`);
    });
    
    // Find lowercase 'sealed'
    console.log('\n\n🔍 Finding records with lowercase "sealed":');
    const sealedRecords = await collection.find({ itemType: 'sealed' }).toArray();
    console.log(`Found ${sealedRecords.length} records with "sealed"`);
    
    sealedRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. ID: ${record._id}`);
      console.log(`   Artist: ${record.artistPopReport}`);
      console.log(`   Album: ${record.albumPopReport}`);
      console.log(`   HoloID: ${record.holoID}`);
    });
    
    console.log('\n\n📊 Summary:');
    console.log(`Records to fix: ${openRecords.length + sealedRecords.length}`);
    
  } finally {
    await client.close();
  }
}

findWrongCase();
