import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


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
  request: NextRequest,
  context: { params: Promise<{ incidentId: string }> }
) {

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

  const { incidentId } = await context.params
  try {
    const body = await request.json();
    const message = await ChatMessage.create({
      incidentId: incidentId,
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