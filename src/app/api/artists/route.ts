import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('grading_db');
    
    const artists = await db.collection('items').distinct('artistPopReport');
    const filteredArtists = artists
      .filter((a: any) => a && typeof a === 'string' && a.trim() !== '')
      .sort();
    
    return NextResponse.json({
      success: true,
      data: filteredArtists
    });
  } catch (error) {
    console.error('Artists endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}