import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const emergency = new EmergencyModel({
      userId: body.userId,
      userName: body.userName,
      userPhone: body.userPhone,
      location: {
        latitude: body.location.latitude,
        longitude: body.location.longitude,
        accuracy: body.location.accuracy,
        timestamp: new Date(),
      },
      emergencyType: body.emergencyType,
      severity: body.severity || 'medium',
      description: body.description,
      status: 'pending',
    });

    await emergency.save();

    return NextResponse.json({
      success: true,
      data: emergency,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating emergency:', error);
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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query = status ? { status } : {};
    
    const emergencies = await EmergencyModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: emergencies,
    });
  } catch (error: any) {
    console.error('Error fetching emergencies:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
