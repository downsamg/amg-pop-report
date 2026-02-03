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
    
    const searchPatterns = {
      $or: [
        { artistPopReport: new RegExp(`^${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`^The ${searchTerm}$`, 'i') },
        { artistPopReport: new RegExp(`\\b${searchTerm}\\b`, 'i') },
        { artistPopReport: { $regex: searchTerm, $options: 'i' } },
        { albumPopReport: new RegExp(`^${searchTerm}$`, 'i') },
        { albumPopReport: new RegExp(`\\b${searchTerm}\\b`, 'i') },
        { albumPopReport: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const availableItemTypes = await db.collection('items').distinct('itemType', searchPatterns);
    const filteredItemTypes = availableItemTypes.filter(t => t && t.trim() !== '' && t !== 'Unknown');
    
    const matchQuery = { ...searchPatterns };

    if (itemType && itemType !== 'Total') {
      matchQuery.itemType = itemType;
    }

    // Group by: Album -> Series -> Variation
    const results = await db.collection('items').aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            album: '$albumPopReport',
            artist: '$artistPopReport',
            series: '$series',
            variation: '$variation'
          },
          grades: { $push: '$masterGrade' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            album: '$_id.album',
            artist: '$_id.artist',
            series: '$_id.series'
          },
          variations: {
            $push: {
              type: '$_id.variation',
              grades: '$grades',
              count: '$count'
            }
          },
          seriesGrades: { $push: '$grades' }
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
              variations: '$variations',
              grades: '$seriesGrades'
            }
          },
          allGrades: { $push: '$seriesGrades' }
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
                variations: {
                  $map: {
                    input: '$$media.variations',
                    as: 'variation',
                    in: {
                      type: '$$variation.type',
                      total: '$$variation.count',
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
                                    input: '$$variation.grades',
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
                total: { 
                  $sum: {
                    $map: {
                      input: '$$media.variations',
                      as: 'v',
                      in: '$$v.count'
                    }
                  }
                },
                gradeDistribution: {
                  $let: {
                    vars: {
                      flatGrades: {
                        $reduce: {
                          input: '$$media.grades',
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
            }
          },
          totalItems: {
            $sum: {
              $map: {
                input: '$mediaTypes',
                as: 'media',
                in: {
                  $sum: {
                    $map: {
                      input: '$$media.variations',
                      as: 'v',
                      in: '$$v.count'
                    }
                  }
                }
              }
            }
          },
          gradeDistribution: {
            $let: {
              vars: {
                flatGrades: {
                  $reduce: {
                    input: {
                      $reduce: {
                        input: '$allGrades',
                        initialValue: [],
                        in: { $concatArrays: ['$$value', '$$this'] }
                      }
                    },
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