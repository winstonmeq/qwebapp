import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const emergencyId = params.id;

    const emergency = await EmergencyModel.findByIdAndUpdate(
      emergencyId,
      {
        $set: {
          status: body.status,
          responderId: body.responderId,
          responderName: body.responderName,
          estimatedArrival: body.estimatedArrival,
        },
      },
      { new: true }
    );

    if (!emergency) {
      return NextResponse.json({
        success: false,
        error: 'Emergency not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: emergency,
    });
  } catch (error: any) {
    console.error('Error updating emergency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const emergency = await EmergencyModel.findById(params.id);

    if (!emergency) {
      return NextResponse.json({
        success: false,
        error: 'Emergency not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: emergency,
    });
  } catch (error: any) {
    console.error('Error fetching emergency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
