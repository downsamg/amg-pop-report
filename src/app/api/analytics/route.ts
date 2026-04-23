import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise();
    const db = client.db('grading_db');

    // Total searches today (unique search terms by day)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Count only "Total" itemType to avoid counting filter clicks
    const todayCount = await db.collection('search_logs')
      .countDocuments({ 
        timestamp: { $gte: todayStart },
        itemType: 'Total'
      });

    const weekCount = await db.collection('search_logs')
      .countDocuments({ 
        timestamp: { $gte: weekStart },
        itemType: 'Total'
      });

    const totalCount = await db.collection('search_logs')
      .countDocuments({ itemType: 'Total' });

    // Top 20 most searched terms (only count "Total" to avoid duplicates)
    const topSearches = await db.collection('search_logs')
      .aggregate([
        { $match: { itemType: 'Total' } },
        {
          $group: {
            _id: '$searchTerm',
            count: { $sum: 1 },
            avgResults: { $avg: '$resultCount' },
            lastSearched: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]).toArray();

    // Zero result searches
    const zeroResults = await db.collection('search_logs')
      .aggregate([
        { $match: { resultCount: 0, itemType: 'Total' } },
        {
          $group: {
            _id: '$searchTerm',
            count: { $sum: 1 },
            lastSearched: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]).toArray();

    // Most recent searches (last 20, only "Total" to avoid filter duplicates)
    const recentSearches = await db.collection('search_logs')
      .find({ itemType: 'Total' })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    // Daily search counts for the past 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailySearches = await db.collection('search_logs')
      .aggregate([
        { $match: { itemType: 'Total', timestamp: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]).toArray();

    return NextResponse.json({
      summary: {
        today: todayCount,
        thisWeek: weekCount,
        allTime: totalCount
      },
      topSearches,
      zeroResults,
      recentSearches,
      dailySearches
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}