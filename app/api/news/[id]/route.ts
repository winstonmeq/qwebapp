import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsModel from '@/models/News'; // adjust path as needed

interface Params {
  params: { id: string };
}



// GET /api/news/[id]
export async function GET(request: NextRequest, 
    context: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await context.params;
    await connectDB();

    const news = await NewsModel.findById(id).lean();
    if (!news) {
      return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/news/[id]
export async function PUT(request: NextRequest, 
    context: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await context.params;

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      'title',
      'content',
      'summary',
      'author',
      'category',
      'tags',
      'imageUrl',
      'lguCode',
      'status',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Set publishedAt if publishing for the first time
    if (updateData.status === 'published') {
      const existing = await NewsModel.findById(id).select('status publishedAt');
      if (existing && existing.status !== 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const news = await NewsModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!news) {
      return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error('Error updating news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/news/[id]
export async function DELETE(request: NextRequest, 
    context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await context.params;
    const news = await NewsModel.findByIdAndDelete(id);
    if (!news) {
      return NextResponse.json({ success: false, error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}