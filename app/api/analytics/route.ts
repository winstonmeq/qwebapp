// app/api/analytics/event/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AnalyticsEvent from '@/models/Analytics';

interface EventBody {
  lguCode: string;
  eventName: string;
  screen: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { lguCode, eventName, screen }: EventBody = await req.json();

    if (!lguCode || !eventName || !screen) {
      return NextResponse.json(
        { error: 'userId, eventName, and screen are required' },
        { status: 400 }
      );
    }

    const event = await AnalyticsEvent.create({ lguCode, eventName, screen });

    return NextResponse.json({ success: true, eventId: event._id }, { status: 201 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}