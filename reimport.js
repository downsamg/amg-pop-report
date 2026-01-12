require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function reimportData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected!');
    
    const db = client.db('grading_db');
    const collection = db.collection('items');
    
    // Clear existing data
    console.log('🗑️  Clearing old data...');
    await collection.deleteMany({});
    
    // Read JSON
    console.log('📖 Reading data.json...');
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    console.log(`📊 Found ${data.length} records`);
    
    // Transform data focusing on pop report fields
    console.log('🔄 Transforming data...');
    const cleanedData = data.map(item => ({
      // IDs
      masterGradeHeaderID: item.MasterGradeHeaderID,
      toyID: item.toyid,
      holoID: item.holoid,
      
      // Pop Report Fields (the important ones!)
      artistPopReport: item.Artist_PopReport,
      albumPopReport: item.Album_PopReport,
      
      // Grading
      masterGrade: item.MasterGrade,
      
      // Additional useful fields
      label: item.label,
      releaseYear: item.ryear,
      tier: item.tier,
      itemType: item.type,
      
      // Dates
      dateEntered: item.DateEntered ? new Date(item.DateEntered) : null,
      gradeDate: item.GradeDate ? new Date(item.GradeDate) : null
    }));
    
    // Insert
    console.log('📤 Uploading to MongoDB...');
    const result = await collection.insertMany(cleanedData);
    console.log(`✅ Imported ${result.insertedCount} records!`);
    
    // Create indexes
    console.log('🔄 Creating indexes...');
    await collection.createIndex({ artistPopReport: 1 });
    await collection.createIndex({ albumPopReport: 1 });
    await collection.createIndex({ masterGrade: 1 });
    await collection.createIndex({ artistPopReport: 1, albumPopReport: 1 });
    
    console.log('✅ Indexes created!');
    console.log('🎉 Reimport complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

reimportData();