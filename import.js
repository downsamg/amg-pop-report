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
    
    // Clear all existing data
    console.log('🗑️  Clearing existing data...');
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old records`);
    
    console.log('📖 Reading data.json...');
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    console.log(`📊 Found ${data.length} records in file`);
    
    console.log('🔄 Transforming and filtering data...');
    const cleanedData = data
      .map(item => {
        // Convert "Authentic" string to 0, keep numbers as-is
        let grade;
        if (item.Grade_PopReport === 'Authentic') {
          grade = 0;
        } else if (typeof item.Grade_PopReport === 'number') {
          grade = item.Grade_PopReport;
        } else if (typeof item.Grade_PopReport === 'string' && !isNaN(item.Grade_PopReport)) {
          grade = parseInt(item.Grade_PopReport);
        } else {
          grade = null;
        }
        
        return {
          // IDs
          memberID: item.memberid,
          holoID: item.holoid,
          
          // Grading - Convert "Authentic" to 0
          masterGrade: grade,
          
          // Item Info
          itemType: item.Type_PopReport,
          series: item.ToySeries,
          variation: item.Variation_PopReport,
          
          // Pop Report fields
          artistPopReport: item.Artist_PopReport,
          albumPopReport: item.Album_PopReport,
          
          // Additional data
          releaseYear: item.ryear,
          discogID: item.discogid,
          
          // Dates
          dateEntered: item.DateEntered ? new Date(item.DateEntered) : null,
          gradeCompleteDate: item.GradeCompleteDateScan ? new Date(item.GradeCompleteDateScan) : null
        };
      })
      // Filter out records with missing critical fields
      .filter(item => {
        // Helper function to check if a value is valid
        const isValid = (value) => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          return true;
        };
        
        // Must have artist OR album
        const hasArtist = isValid(item.artistPopReport);
        const hasAlbum = isValid(item.albumPopReport);
        
        // Must have a valid grade (0 = Authentic is valid!)
        const hasGrade = item.masterGrade !== null && 
                        item.masterGrade !== undefined && 
                        item.masterGrade >= 0 && 
                        item.masterGrade <= 10;
        
        // Must have a valid item type
        const hasItemType = isValid(item.itemType) && item.itemType !== 'Unknown';
        
        return (hasArtist || hasAlbum) && hasGrade && hasItemType;
      });
    
    console.log(`✅ After filtering: ${cleanedData.length} valid records`);
    console.log(`❌ Filtered out: ${data.length - cleanedData.length} invalid records`);
    
    if (cleanedData.length === 0) {
      console.error('⚠️  No valid records found! Check your data file.');
      return;
    }
    
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
    
    // Show summary
    console.log('\n📊 Import Summary:');
    
    const itemTypes = await collection.distinct('itemType');
    console.log('\nItem Types:', itemTypes);
    for (const type of itemTypes) {
      const count = await collection.countDocuments({ itemType: type });
      console.log(`  ${type}: ${count} records`);
    }
    
    const totalArtists = await collection.distinct('artistPopReport');
    console.log(`\nUnique Artists: ${totalArtists.filter(a => a).length}`);
    
    const totalAlbums = await collection.distinct('albumPopReport');
    console.log(`Unique Albums: ${totalAlbums.filter(a => a).length}`);
    
    const gradeDistribution = await collection.aggregate([
      { $group: { _id: '$masterGrade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\nGrade Distribution:');
    gradeDistribution.forEach(g => {
      const gradeLabel = g._id === 0 ? 'Authentic (0)' : `Grade ${g._id}`;
      console.log(`  ${gradeLabel}: ${g.count} records`);
    });
    
    console.log('\n🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

importData();