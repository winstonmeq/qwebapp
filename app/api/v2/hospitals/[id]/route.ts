import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Hospital from "@/models/Hospital";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {

     const session = await getServerSession(authOptions); 
        
     
        if (!session || session?.user.role !== 'system-admin') {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }

    await connectDB();
    const params = await context.params;
    const hospital = await Hospital.findById(params.id);
    if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: hospital });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch hospital" }, { status: 500 });
  }
}



export async function PUT(request: NextRequest,context: { params: Promise<{ id: string }> }) {
  try {

     const session = await getServerSession(authOptions);

    if (!session || session?.user.role !== 'system-admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }


    await connectDB();
    const params = await context.params;
    const body = await request.json();
    const hospital = await Hospital.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: hospital });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update hospital" }, { status: 400 });
  }
}



export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {

     const session = await getServerSession(authOptions);
 
    if (!session || session?.user.role !== 'system-admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const params = await context.params;
    const hospital = await Hospital.findByIdAndDelete(params.id);
    if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete hospital" }, { status: 500 });
  }
}