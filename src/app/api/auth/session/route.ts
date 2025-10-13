import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
