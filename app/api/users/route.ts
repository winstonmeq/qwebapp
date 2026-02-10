import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';


// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Only admins can view all users
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Admin access required',
      }, { status: 403 });
    }

    await connectDB();

    const users = await UserModel.find({})
      .select('-password')
      .sort({ createdAt: -1 });

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

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Only admins can create users
    if (session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Admin access required',
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, role, isActive } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required',
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters',
      }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email or phone already exists',
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      lastSeen: new Date(),
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    // delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
