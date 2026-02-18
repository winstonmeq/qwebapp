import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Country from '@/models/Country';

// GET all countries
export async function GET() {
  await connectDB();
  const countries = await Country.find({}).sort({ name: 1 });
  return NextResponse.json(countries);
}

// POST new country
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const newCountry = await Country.create(data);
    return NextResponse.json(newCountry, { status: 201 });
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

    await Country.findByIdAndDelete(id); // Change Model name based on the file
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}