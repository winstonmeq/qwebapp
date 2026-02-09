import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    const user = await UserModel.findOneAndUpdate(
      { phone: body.phone },
      {
        $set: {
          name: body.name,
          currentLocation: {
            latitude: body.location.latitude,
            longitude: body.location.longitude,
            accuracy: body.location.accuracy,
            timestamp: new Date(),
          },
          isActive: true,
          lastSeen: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error updating location:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active') === 'true';

    const query = isActive ? { isActive: true } : {};
    
    const users = await UserModel.find(query).sort({ lastSeen: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
