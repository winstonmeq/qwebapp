import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Validate GeoJSON requirements
    const longitude = Number(body.location.longitude);
    const latitude = Number(body.location.latitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      return NextResponse.json({ success: false, error: 'Invalid coordinates' }, { status: 400 });
    }
    
    const emergency = new EmergencyModel({
      lguCode: body.lguCode, // IMPORTANT: Required by your model
      userId: body.userId,
      userName: body.userName,
      userPhone: body.userPhone,
      location: {
        type: 'Point', // Explicitly set as per LocationSchema
        coordinates: [longitude, latitude], // [long, lat] order
        accuracy: Number(body.location.accuracy || 0),
      },
      emergencyType: body.emergencyType,
      severity: body.severity || 'medium',
      description: body.description,
      status: 'pending',
      // responderId and responderName are optional, so they stay undefined initially
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
    const lguCode = searchParams.get('lguCode'); // Added lguCode filter
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build dynamic query
    const query: any = {};
    if (status) query.status = status;
    if (lguCode) query.lguCode = lguCode;
    
    const emergencies = await EmergencyModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      count: emergencies.length,
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