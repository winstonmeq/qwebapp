import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Province from '@/models/Province';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get('countryCode');
  
  // Filter by country if provided, otherwise get all
  const query = countryCode ? { countryCode } : {};
  const provinces = await Province.find(query).sort({ name: 1 });
  
  return NextResponse.json(provinces);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const newProvince = await Province.create(data);
    return NextResponse.json(newProvince, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Add this to your Route Handlers
export async function DELETE(req: Request) {
    try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
      await Province.findByIdAndDelete(id); // Change Model name based on the file
      return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }