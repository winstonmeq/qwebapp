import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 });
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      folder: 'news',
      transformation: [
        { width: 1200, height: 630, crop: 'fill', gravity: 'auto' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return NextResponse.json({
      success: true,
      url:       result.secure_url,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}