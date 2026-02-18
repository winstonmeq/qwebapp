import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function PUT(
  request: NextRequest,
  context : {params: Promise<{ id: string }>}
) {
  try {
    const body = await request.json();
    const { phone, sex, age, province, municipality, barangay, isActive } = body;

    const { id } = await context.params;
    await connectDB();



    // We only update the profile fields. Password logic is completely removed.
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          phone,
          sex,
          age,
          province,
          municipality,
          barangay,
          isActive: isActive ?? true,
          lastSeen: new Date(),
        }
      },
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