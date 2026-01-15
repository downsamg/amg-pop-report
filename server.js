require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
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

// Get all unique artists
app.get('/api/artists', async (req, res) => {
  try {
    const artists = await db.collection('items').distinct('artistPopReport');
    const filteredArtists = artists.filter(a => a && a.trim() !== '');
    
    res.json({
      success: true,
      data: filteredArtists.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get population report for artist
app.get('/api/item-types', async (req, res) => {
  try {
    const types = await db.collection('items').distinct('itemType');
    const filteredTypes = types.filter(t => t && t.trim() !== '');
    
    res.json({
      success: true,
      data: filteredTypes.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update the /api/pop-report endpoint
app.get('/api/pop-report', async (req, res) => {
  try {
    const { artist, itemType } = req.query;

    if (!artist) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an artist name'
      });
    }

    // Clean up search term and create flexible regex pattern
    const searchTerm = artist.trim();
    
    // First, get all available itemTypes for this artist
    const artistMatch = {
      $or: [
        { artistPopReport: new RegExp(`^${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`^The ${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`\\b${searchTerm}\\b`, 'i') },
        { artistPopReport: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    const availableItemTypes = await db.collection('items').distinct('itemType', artistMatch);
    const filteredItemTypes = availableItemTypes.filter(t => t && t.trim() !== '');
    
    // Build match query
    const matchQuery = { ...artistMatch };

    // Add itemType filter if provided
    if (itemType && itemType !== 'Total') {
      matchQuery.itemType = itemType;
    }

    // Get albums grouped by series (Vinyl Record, CD, Cassette, etc.)
    const results = await db.collection('items').aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            album: '$albumPopReport',
            series: '$series',
            artist: '$artistPopReport'
          },
          grades: { $push: '$masterGrade' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            album: '$_id.album',
            artist: '$_id.artist'
          },
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
          album: '$_id.album',
          artist: '$_id.artist',
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
        actualArtist: null,
        itemType: itemType || 'Total',
        availableItemTypes: filteredItemTypes,
        count: 0,
        data: []
      });
    }

    // Get the actual artist name from results
    const actualArtist = results[0].artist || artist;

    res.json({
      success: true,
      artist: artist,
      actualArtist: actualArtist,
      itemType: itemType || 'Total',
      availableItemTypes: filteredItemTypes,
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