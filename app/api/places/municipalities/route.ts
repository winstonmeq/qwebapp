import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Municipality from '@/models/Municipality';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const provinceCode = searchParams.get('provinceCode');

  const query = provinceCode ? { provinceCode } : {};
  const LGUs = await Municipality.find(query).sort({ name: 1 });
  
  return NextResponse.json(LGUs);
}



export async function POST(req: Request) {
  try {

    await connectDB();

    const data = await req.json();
    
    console.log('mao nih data', data)
    // Ensure coverage is formatted as valid GeoJSON if provided
    const newLGU = await Municipality.create(data);

    console.log('newLGU', newLGU)

    return NextResponse.json(newLGU, { status: 201 });

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
  
      await Municipality.findByIdAndDelete(id); // Change Model name based on the file
      return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }