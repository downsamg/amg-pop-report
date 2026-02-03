// check-variation.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkVariation() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('grading_db');
    
    const sample = await db.collection('items').findOne({});
    
    console.log('Available fields:');
    console.log(Object.keys(sample));
    
    console.log('\n\nVariation_PopReport value:', sample.Variation_PopReport);
    
    const variations = await db.collection('items').distinct('Variation_PopReport');
    console.log('\n\nUnique variations:', variations);
    
  } finally {
    await client.close();
  }
}

checkVariation();