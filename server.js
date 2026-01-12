require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Password middleware
function checkPassword(req, res, next) {
  const password = req.headers['x-access-password'] || req.query.password;
  
  if (password === process.env.ACCESS_PASSWORD) {
    next();
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid password' 
    });
  }
}

// Serve static files only after password check for API routes
app.use(express.static('public'));

let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db('grading_db');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

connectDB();

// Verify password endpoint
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.ACCESS_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid password' 
    });
  }
});

// Protected API routes
app.get('/api/artists', checkPassword, async (req, res) => {
  try {
    const artists = await db.collection('items')
      .distinct('artistPopReport', { artistPopReport: { $ne: null, $ne: '' } });
    
    res.json({
      success: true,
      data: artists.sort()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/pop-report', checkPassword, async (req, res) => {
  try {
    const { artist } = req.query;
    
    if (!artist) {
      return res.status(400).json({ 
        success: false, 
        error: 'Artist parameter required' 
      });
    }

    const popReport = await db.collection('items').aggregate([
      {
        $match: { 
          artistPopReport: artist
        }
      },
      {
        $group: {
          _id: {
            album: '$albumPopReport',
            grade: '$masterGrade'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.album',
          grades: {
            $push: {
              grade: '$_id.grade',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    const tableData = popReport.map(album => {
      const row = {
        album: album._id || 'Unknown Album',
        total: album.totalCount,
        grade1: 0,
        grade2: 0,
        grade3: 0,
        grade4: 0,
        grade5: 0,
        grade6: 0,
        grade7: 0,
        grade8: 0,
        grade9: 0,
        grade10: 0
      };

      album.grades.forEach(g => {
        if (g.grade >= 1 && g.grade <= 10) {
          row[`grade${g.grade}`] = g.count;
        }
      });

      return row;
    });

    res.json({
      success: true,
      artist: artist,
      data: tableData
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', checkPassword, async (req, res) => {
  try {
    const totalItems = await db.collection('items').countDocuments();
    const totalArtists = await db.collection('items')
      .distinct('artistPopReport', { artistPopReport: { $ne: null, $ne: '' } });

    res.json({
      success: true,
      data: {
        totalItems,
        totalArtists: totalArtists.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
