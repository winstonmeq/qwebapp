import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';


// GET — fetch last 50 messages for an incident
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ incidentId: string }> }
) {
  await connectDB();

  const { incidentId } = await context.params;
  try {
    const messages = await ChatMessage.find({ incidentId })
      .sort({ timestamp: -1 }) // newest first
      .limit(50)               // only 50
      .then(msgs => msgs.reverse()); // flip back to oldest→newest for display

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST — save a new message
export async function POST(
  req: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  await connectDB();
  try {
    const body = await req.json();
    const message = await ChatMessage.create({
      incidentId: params.incidentId,
      text: body.text,
      sender: body.sender,
      role: body.role,
      timestamp: body.timestamp || new Date(),
    });
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save message' }, { status: 500 });
  }
}