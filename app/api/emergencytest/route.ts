// app/api/emergency/route.ts
import { NextRequest, NextResponse } from "next/server";
import EmergencyModel from "@/models/Emergency";
import connectDB from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();

  const emergency = await EmergencyModel.create(body);

  // Emit to LGU dashboard queue
  if (global.io) {
    global.io.connect(`lgu_${emergency.lguCode}`).emit("newEmergency", emergency);
  }

  return NextResponse.json(emergency);
}