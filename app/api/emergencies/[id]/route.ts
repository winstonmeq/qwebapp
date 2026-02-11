import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmergencyModel from '@/models/Emergency';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';


export async function PATCH(
  request: NextRequest,
  // { params }: { params: { id: string } }
  context: { params: Promise<{ id: string }> }

) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();

    const { id } = await context.params;

    const emergencyId = id;


   console.log('this is',emergencyId);


    const updateData: any = {
      status: body.status,
    };

    // Add responder info if provided
    if (body.responder) {
      updateData.responder = body.responder;
    }

    // Add acknowledge details if provided
    if (body.acknowledgeDetails) {
      updateData.acknowledgeDetails = body.acknowledgeDetails;
    }

    // Add response details if provided
    if (body.responseDetails) {
      updateData.responseDetails = body.responseDetails;
    }

    // Add resolved timestamp if status is resolved
    if (body.status === 'resolved' && body.resolvedAt) {
      updateData.resolvedAt = body.resolvedAt;
    }

    const emergency = await EmergencyModel.findByIdAndUpdate(
      emergencyId,
      { $set: updateData },
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Only admins can delete emergencies
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Admin access required',
      }, { status: 403 });
    }

    await connectDB();
    
    const emergency = await EmergencyModel.findByIdAndDelete(params.id);

    if (!emergency) {
      return NextResponse.json({
        success: false,
        error: 'Emergency not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting emergency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
