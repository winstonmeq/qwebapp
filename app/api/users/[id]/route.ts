import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';




// GET - Fetch single user
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

    const user = await UserModel.findById(params.id).select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // Users can view their own profile, admins can view any
    if (session.user.id !== params.id && session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden',
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(
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

    const body = await request.json();
    const { name, email, phone, password, role, isActive } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and phone are required',
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
      }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findById(params.id);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    // Check permissions
    const canEditRole = session.user.role === 'admin';
    const canEditSelf = session.user.id === params.id;

    if (!canEditRole && !canEditSelf) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - You can only edit your own profile',
      }, { status: 403 });
    }

    // Check for duplicate email/phone
    const existingUser = await UserModel.findOne({
      _id: { $ne: params.id },
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email or phone already in use',
      }, { status: 400 });
    }

    // Update user fields
    user.name = name;
    user.email = email;
    user.phone = phone;

    // Only admins can change role and active status
    if (canEditRole) {
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({
          success: false,
          error: 'Password must be at least 6 characters',
        }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return user without password
    const userResponse = await UserModel.findById(params.id)
    .select('-password');

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE - Delete user
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

    // Only admins can delete users
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Admin access required',
      }, { status: 403 });
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete your own account',
      }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// PATCH - Partial update (for quick role/status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    const user = await UserModel.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
