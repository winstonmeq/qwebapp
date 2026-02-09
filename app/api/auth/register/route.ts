import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required',
      }, { status: 400 });
    }

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
      role: role || 'user', // Default to user role
      isActive: true,
      lastSeen: new Date(),
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User registered successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
