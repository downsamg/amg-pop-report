import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('grading_db');
    
    const types = await db.collection('items').distinct('itemType');
    const filteredTypes = types
      .filter((t: any) => t && typeof t === 'string' && t.trim() !== '')
      .sort();
    
    return NextResponse.json({
      success: true,
      data: filteredTypes
    });
  } catch (error) {
    console.error('Item types endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item types' },
      { status: 500 }
    );
  }
}