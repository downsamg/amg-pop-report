require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function appendData(jsonFilePath) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    // Read the new JSON file
    console.log(`📖 Reading ${jsonFilePath}...`);
    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    console.log(`✅ Found ${data.length} records in JSON file`);

    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('grading_db');
    const collection = db.collection('items');

    // Count existing records
    const existingCount = await collection.countDocuments();
    console.log(`📊 Existing records in database: ${existingCount}`);

    // Function to parse "30-Jan-26" date format
    function parseDate(dateStr) {
      if (!dateStr) return null;
      
      // Handle "30-Jan-26" format
      const [day, monthStr, year] = dateStr.split('-');
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const month = monthMap[monthStr];
      const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
      return new Date(fullYear, month, parseInt(day));
    }

    // Keep the exact structure from JSON
    const cleanedData = data.map(item => ({
      memberid: item.memberid,
      DateEntered: parseDate(item.DateEntered),
      ToySeries: item.ToySeries,
      GradeCompleteDateScan: parseDate(item.GradeCompleteDateScan),
      ryear: item.ryear,
      discogid: item.discogid,
      Artist_PopReport: item.Artist_PopReport,
      Album_PopReport: item.Album_PopReport,
      Grade_PopReport: item.Grade_PopReport,
      Type_PopReport: item.Type_PopReport,
      Variation_PopReport: item.Variation_PopReport
    }));

    // Show sample of what will be imported
    console.log('\n📋 Sample record that will be imported:');
    console.log(JSON.stringify(cleanedData[0], null, 2));
    console.log('\n⏳ Inserting new records...');

    const result = await collection.insertMany(cleanedData);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} new records`);
    
    // Count total records now
    const newCount = await collection.countDocuments();
    console.log(`📊 Total records in database: ${newCount}`);
    console.log(`➕ Net new records added: ${newCount - existingCount}`);

    // Show some stats
    const artists = await collection.distinct('Artist_PopReport');
    const albums = await collection.distinct('Album_PopReport');
    
    console.log('\n📈 Database Stats:');
    console.log(`   Unique Artists: ${artists.length}`);
    console.log(`   Unique Albums: ${albums.length}`);
    console.log(`   Total Items: ${newCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Get filename from command line argument
const filename = process.argv[2];

if (!filename) {
  console.error('❌ Please provide a JSON filename');
  console.log('Usage: node append-data.js your-new-data.json');
  process.exit(1);
}

appendData(filename);