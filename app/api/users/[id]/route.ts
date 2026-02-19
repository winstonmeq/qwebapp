import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const user = await UserModel.findById(id).select('-password'); // Exclude sensitive data

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { 
      phone, 
      sex, 
      age, 
      province, 
      municipality, 
      barangay, 
      isActive,
      location // This is the new field coming from your Flutter app
    } = body;

    const { id } = await context.params;
    await connectDB();

    // Prepare the update object
    const updateData: any = {
      phone,
      sex,
      age,
      province,
      municipality,
      barangay,
      isActive: isActive ?? true,
      lastSeen: new Date(),
    };

    // Only add location to update if it exists and is valid GeoJSON
    if (location && location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: [
          location.coordinates[0], // Longitude
          location.coordinates[1]  // Latitude
        ]
      };
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });

  } catch (error: any) {
    // Handle uniqueness constraint for Phone
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is already in use by another account' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}