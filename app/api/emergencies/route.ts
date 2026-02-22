import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Initialize query
    let query: any = {};

    /**
     * ROLE-BASED ACCESS CONTROL (RBAC) LOGIC:
     * 1. system-admin: Sees everything (lguCode remains empty in query)
     * 2. responder (or any other role): Must be filtered by their specific lguCode
     */
    if (session.user.role === 'system-admin') {
      // Logic: Leave query.lguCode undefined to fetch all records across all LGUs
    } else {
      // Logic: For responders or LGU-admins, enforce the lguCode filter
      if (!session.user.lguCode) {
        return NextResponse.json(
          { success: false, error: 'Access denied: No LGU Code assigned to your account' }, 
          { status: 403 }
        );
      }
      query.lguCode = session.user.lguCode;
    }

    // ─── Extract Search Params ──────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Add status filter if provided in the URL
    if (status) {
      query.status = status;
    }

    // ─── Execute Database Query ─────────────────────────────────────────────
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

    console.log('Creating emergency with data:', body);
    
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
