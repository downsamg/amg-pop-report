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

// Get all unique albums
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await db.collection('items').distinct('albumPopReport');
    const filteredAlbums = albums.filter(a => a && a.trim() !== '');
    
    res.json({
      success: true,
      data: filteredAlbums.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all unique itemTypes
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

// Smart search endpoint - searches both artist and album
app.get('/api/search', async (req, res) => {
  try {
    const { q, itemType } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a search term'
      });
    }

    const searchTerm = q.trim();
    
    // Search patterns
    const searchPatterns = {
      $or: [
        // Artist matches
        { artistPopReport: new RegExp(`^${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`^The ${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`\\b${searchTerm}\\b`, 'i') },
        { artistPopReport: { $regex: searchTerm, $options: 'i' } },
        // Album matches
        { albumPopReport: new RegExp(`^${searchTerm}$`, 'i') },
        { albumPopReport: new RegExp(`\\b${searchTerm}\\b`, 'i') },
        { albumPopReport: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Get available itemTypes for this search
    const availableItemTypes = await db.collection('items').distinct('itemType', searchPatterns);
    const filteredItemTypes = availableItemTypes.filter(t => t && t.trim() !== '');
    
    // Build match query
    const matchQuery = { ...searchPatterns };

    // Add itemType filter if provided
    if (itemType && itemType !== 'Total') {
      matchQuery.itemType = itemType;
    }

    // Aggregate to get results grouped by artist-album combination
    const results = await db.collection('items').aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            album: '$albumPopReport',
            artist: '$artistPopReport',
            series: '$series'
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
        $sort: { artist: 1, album: 1 }
      }
    ]).toArray();

    if (results.length === 0) {
      return res.json({
        success: true,
        searchTerm: searchTerm,
        itemType: itemType || 'Total',
        availableItemTypes: filteredItemTypes,
        count: 0,
        data: []
      });
    }

    res.json({
      success: true,
      searchTerm: searchTerm,
      itemType: itemType || 'Total',
      availableItemTypes: filteredItemTypes,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/search`);
});