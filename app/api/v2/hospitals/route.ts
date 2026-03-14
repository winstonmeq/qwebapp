import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Hospital from "@/models/Hospital";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "inspector/promises";



export async function GET(request: NextRequest) 
{
  try {
      
    const session = await getServerSession(authOptions);
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.MOBILE_API_SECRET_KEY;

    if (!session && apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

        
    await connectDB();

    // 1. Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // 2. Extract the 'hospital' parameter (which is your lguCode)
    const lguCode = searchParams.get('lguCode');
    console.log('mao ni lguCode gikan sa mobile', lguCode)


    // 3. Create a filter object. If lguCode exists, filter by it.
    // Replace 'lguCode' with the actual field name in your MongoDB schema
    const filter = lguCode ? { lguCode: lguCode } : {};

    // 4. Find hospitals based on the filter
    const hospitals = await Hospital.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ data: hospitals });

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}







export async function POST(request: NextRequest) {
  try {

   const session = await getServerSession(authOptions);

    
 
    if (!session || session?.user.role !== 'system-admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await connectDB();

    const body = await request.json();
    const hospital = await Hospital.create(body);
    return NextResponse.json({ data: hospital }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create hospital" }, { status: 400 });
  }
}