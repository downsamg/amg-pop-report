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
    
    // Read your JSON file
    console.log('📖 Reading data.json...');
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    console.log(`📊 Found ${data.length} records`);
    
    // Transform the data to clean it up
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
      itemType: item.type || 'Unknown',
      universe: item.ToyUniverse,
      series: item.ToySeries,
      manufacturer: item.ToyManuf,
      
      // Vinyl-specific data (if exists)
      vinyl: item.artist ? {
        artist: item.artist,
        album: item.album,
        label: item.label,
        catalogNum: item.catnum,
        releaseYear: item.ryear,
        tier: item.tier,
        size: item.size,
        speed: item.speed,
        discogID: item.discogid,
        firstPress: item.firstpress === 'TRUE',
        promo: item.promo === 'TRUE',
        description: item.toydesc
      } : null,
      
      // Dates
      dateEntered: item.DateEntered ? new Date(item.DateEntered) : null,
      gradeDate: item.GradeDate ? new Date(item.GradeDate) : null,
      
      // Search field (combined text for easy searching)
      searchText: [
        item.artist,
        item.album,
        item.label,
        item.ToyManuf,
        item.toydesc
      ].filter(Boolean).join(' ').toLowerCase(),
      
      // Flags
      approved: item.approved === 'TRUE',
      archived: item.Archived === 'TRUE',
      exportToWeb: item.ExportToWeb === 'TRUE'
    }));
    
    // Insert into MongoDB
    console.log('📤 Uploading to MongoDB...');
    const result = await collection.insertMany(cleanedData);
    console.log(`✅ Imported ${result.insertedCount} records!`);
    
    // Create search indexes
    console.log('🔄 Creating search indexes...');
    await collection.createIndex({ searchText: 'text' });
    await collection.createIndex({ masterGrade: 1 });
    await collection.createIndex({ 'vinyl.artist': 1 });
    await collection.createIndex({ itemType: 1 });
    
    console.log('✅ Created search indexes!');
    console.log('🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

importData();