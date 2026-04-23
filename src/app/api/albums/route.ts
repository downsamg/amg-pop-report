import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('grading_db');
    
    const albums = await db.collection('items').distinct('albumPopReport');
    const filteredAlbums = albums
      .filter((a: any) => a && typeof a === 'string' && a.trim() !== '')
      .sort();
    
    return NextResponse.json({
      success: true,
      data: filteredAlbums
    });
  } catch (error) {
    console.error('Albums endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}