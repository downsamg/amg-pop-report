require('dotenv').config();
const { MongoClient } = require('mongodb');

async function fixCase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    const collection = db.collection('items');
    
    // Fix lowercase 'open' to 'Open'
    console.log('🔧 Fixing "open" to "Open"...');
    const openResult = await collection.updateMany(
      { itemType: 'open' },
      { $set: { itemType: 'Open' } }
    );
    console.log(`✅ Fixed ${openResult.modifiedCount} records from "open" to "Open"`);
    
    // Fix lowercase 'sealed' to 'Sealed'
    console.log('\n🔧 Fixing "sealed" to "Sealed"...');
    const sealedResult = await collection.updateMany(
      { itemType: 'sealed' },
      { $set: { itemType: 'Sealed' } }
    );
    console.log(`✅ Fixed ${sealedResult.modifiedCount} records from "sealed" to "Sealed"`);
    
    // Verify the fix
    console.log('\n📊 Verification:');
    const itemTypes = await collection.distinct('itemType');
    console.log('All itemTypes now:', itemTypes);
    
    for (const type of itemTypes.sort()) {
      const count = await collection.countDocuments({ itemType: type });
      console.log(`  ${type}: ${count} records`);
    }
    
    console.log('\n🎉 All done!');
    
  } finally {
    await client.close();
  }
}

fixCase();
