import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// GET - Fetch users (Security: System Admin sees all, Others see only their LGU)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let query = {};
    // If not a system-admin, filter by the admin's lguCode
    if (session.user.role !== 'system-admin') {
      if (!session.user.lguCode) {
        return NextResponse.json({ success: false, error: 'LGU Code missing from session' }, { status: 403 });
      }
      query = { lguCode: session.user.lguCode };
    }

    const users = await UserModel.find(query)
      .select('-password') // Safety precaution even if empty
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create user (Admin only - Google users usually self-register, but this is for manual entry)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'system-admin') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role, lguCode, googleId, image } = body;

    if (!name || !email || !googleId) {
      return NextResponse.json({ success: false, error: 'Name, Email, and Google ID are required' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    const user = new UserModel({
      name,
      email,
      phone,
      googleId,
      image,
      role: role || 'user',
      lguCode: lguCode || session.user.lguCode,
      isActive: true,
      lastSeen: new Date(),
    });

    await user.save();

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}