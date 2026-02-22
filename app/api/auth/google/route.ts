import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

// Initialize the Google Client with your Web Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, role } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    // 1. Verify the ID Token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token payload' }, { status: 400 });
    }

    // Extract user info from Google's payload
    const { email, name, picture, sub: googleId } = payload;

    // 2. Find or Create the user in MongoDB
    let user = await UserModel.findOne({ email });

    if (!user) {
      // Create new user (Password is not needed for Google users)
      user = new UserModel({
        name,
        email,
        googleId, // Store this to identify they are a Google user
        image: picture,
        role: role || 'user',
        isActive: true,
        lastSeen: new Date(),
      });
      await user.save();
    } else {
      // Optional: Update their profile picture or last seen if they already exist
      user.lastSeen = new Date();
      if (googleId && !user.googleId) user.googleId = googleId;
      await user.save();
    }

    // 3. Return the user data (Exclude sensitive fields)
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone ?? '',
        lguCode: user.lguCode ?? '',
        municipality: user.municipality ?? '',
        barangay: user.barangay ?? '',
        province: user.province ?? '',
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify Google account' 
    }, { status: 401 });
  }
}