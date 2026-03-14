import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsModel from '@/models/News'; // adjust path as needed
import { notifyByLguCode } from '@/lib/fcmNotify';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/news — fetch all news with optional filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 10)));
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const lguCode = searchParams.get('lguCode');
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (lguCode) filter.lguCode = lguCode;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [news, total] = await Promise.all([
      NewsModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      NewsModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/news — create a new news article
export async function POST(request: NextRequest) {
  try {



     const session = await getServerSession(authOptions);
         
        if (!session || session?.user.role === 'user') {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }
        
    await connectDB();

    const body = await request.json();

    const news = new NewsModel({
      title: body.title,
      content: body.content,
      summary: body.summary,
      author: body.author,
      category: body.category || 'general',
      tags: body.tags || [],
      imageUrl: body.imageUrl,
      lguCode: body.lguCode,
      status: body.status || 'draft',
    });

    await news.save();


      // ✅ Notify users only when published (not draft)
    if (news.status === 'published' && news.lguCode) {
      notifyByLguCode(
        news.lguCode,
        news.title,
        news.summary || 'New update from your local government.',
        { newsId: news._id.toString(), category: news.category }
      ).catch((err) => console.error('FCM notify failed:', err)); // non-blocking
    }
    

    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}