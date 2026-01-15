require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    
    const db = client.db('grading_db');
    const collection = db.collection('items');
    
    // IMPORTANT: Clear existing data first
    console.log('🗑️  Clearing existing data...');
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old records`);
    
    console.log('📖 Reading data.json...');
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    console.log(`📊 Found ${data.length} records`);
    
    console.log('🔄 Transforming data...');
    const cleanedData = data.map(item => ({
      // IDs
      masterGradeHeaderID: item.MasterGradeHeaderID,
      toyID: item.toyid,
      memberID: item.memberid,
      holoID: item.holoid,
      
      // Grading
      masterGrade: item.MasterGrade,
      cardSubGrade: item.CardSubGrade,
      bubbleSubGrade: item.BubbleSubGrade,
      figureSubGrade: item.FigureSubGrade,
      
      // Item Info
      itemType: item.Type_PopReport || 'Unknown',  // UPDATED: Using type_PopReport now
      universe: item.ToyUniverse,
      series: item.ToySeries,  // Vinyl Record, CD, Cassette, 8-Track
      manufacturer: item.ToyManuf,
      
      // Pop Report fields
      artistPopReport: item.Artist_PopReport,
      albumPopReport: item.Album_PopReport,
      
      // Vinyl-specific data
      label: item.label,
      releaseYear: item.ryear,
      tier: item.tier,
      
      // Dates
      dateEntered: item.DateEntered ? new Date(item.DateEntered) : null,
      gradeDate: item.GradeDate ? new Date(item.GradeDate) : null,
      
      // Flags
      approved: item.approved === 'TRUE',
      archived: item.Archived === 'TRUE',
      exportToWeb: item.ExportToWeb === 'TRUE'
    }));
    
    console.log('📤 Uploading to MongoDB...');
    const result = await collection.insertMany(cleanedData);
    console.log(`✅ Imported ${result.insertedCount} records!`);
    
    console.log('🔄 Creating search indexes...');
    await collection.createIndex({ artistPopReport: 1 });
    await collection.createIndex({ albumPopReport: 1 });
    await collection.createIndex({ series: 1 });
    await collection.createIndex({ itemType: 1 });
    await collection.createIndex({ masterGrade: 1 });
    
    console.log('✅ Created search indexes!');
    
    // Show sample of itemTypes
    console.log('\n📊 Sample itemTypes in data:');
    const itemTypes = await collection.distinct('itemType');
    console.log(itemTypes);
    
    // Show count per type
    console.log('\n📊 Count per itemType:');
    for (const type of itemTypes) {
      const count = await collection.countDocuments({ itemType: type });
      console.log(`  ${type}: ${count} records`);
    }
    
    console.log('\n🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

importData();