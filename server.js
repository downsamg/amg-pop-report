require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
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

// Get all unique artists for autocomplete
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await db.collection('items').distinct('artistPopReport');
    
    // Filter out null/empty and sort
    const cleanArtists = artists
      .filter(a => a && a.trim())
      .sort();
    
    res.json({
      success: true,
      data: cleanArtists
    });
  } catch (error) {
    console.error('Artists error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Population Report - Artist search with grade distribution
app.get('/api/pop-report', async (req, res) => {
  try {
    const { artist } = req.query;

    if (!artist) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an artist name'
      });
    }

    // Get albums grouped by series (Vinyl Record, CD, Cassette, etc.)
    const results = await db.collection('items').aggregate([
      {
        $match: {
          artistPopReport: new RegExp(`^${artist}$`, 'i')
        }
      },
      {
        $group: {
          _id: {
            album: '$albumPopReport',
            series: '$series'  // Using 'series' field now
          },
          grades: { $push: '$masterGrade' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.album',
          mediaTypes: {
            $push: {
              type: '$_id.series',
              grades: '$grades',
              count: '$count'
            }
          },
          allGrades: { $push: '$grades' }
        }
      },
      {
        $project: {
          album: '$_id',
          mediaTypes: {
            $map: {
              input: '$mediaTypes',
              as: 'media',
              in: {
                type: '$$media.type',
                total: '$$media.count',
                gradeDistribution: {
                  $arrayToObject: {
                    $map: {
                      input: { $range: [1, 11] },
                      as: 'grade',
                      in: {
                        k: { $toString: '$$grade' },
                        v: {
                          $size: {
                            $filter: {
                              input: '$$media.grades',
                              as: 'g',
                              cond: { $eq: ['$$g', '$$grade'] }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          totalItems: { $sum: '$mediaTypes.count' },
          gradeDistribution: {
            $let: {
              vars: {
                flatGrades: {
                  $reduce: {
                    input: '$allGrades',
                    initialValue: [],
                    in: { $concatArrays: ['$$value', '$$this'] }
                  }
                }
              },
              in: {
                $arrayToObject: {
                  $map: {
                    input: { $range: [1, 11] },
                    as: 'grade',
                    in: {
                      k: { $toString: '$$grade' },
                      v: {
                        $size: {
                          $filter: {
                            input: '$$flatGrades',
                            as: 'g',
                            cond: { $eq: ['$$g', '$$grade'] }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { album: 1 }
      }
    ]).toArray();

    if (results.length === 0) {
      return res.json({
        success: true,
        artist: artist,
        count: 0,
        data: []
      });
    }

    res.json({
      success: true,
      artist: artist,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Pop report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/pop-report`);
});
