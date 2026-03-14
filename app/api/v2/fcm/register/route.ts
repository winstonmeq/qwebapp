import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FcmTokenModel from '@/models/Fcmtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {

     const session = await getServerSession(authOptions);     
     
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.MOBILE_API_SECRET_KEY;

    if (!session && apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

        
    await connectDB();

    const body = await request.json();
    const { userId, lguCode, token } = body;

    if (!userId || !lguCode || !token) {
      return NextResponse.json(
        { success: false, error: 'userId, lguCode, and token are required' },
        { status: 400 }
      );
    }

    // Upsert — update token if user exists, create if not
    await FcmTokenModel.findOneAndUpdate(
      { userId },
      { lguCode, token },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('FCM register error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}