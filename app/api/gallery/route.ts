import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// GET - Fetch images from Cloudinary
export async function GET() {
  try {
    const folderName = process.env.CLOUDINARY_FOLDER || 'raveculture';

    // Use folder: prefix without wildcard for Cloudinary search
    const results = await cloudinary.search
      .expression(`folder:${folderName}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const images = (results.resources || []).map((resource: {
      asset_id: string;
      public_id: string;
      format: string;
      width: number;
      height: number;
      secure_url: string;
      created_at: string;
    }) => ({
      id: resource.asset_id,
      public_id: resource.public_id,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      secure_url: resource.secure_url,
      created_at: resource.created_at,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return NextResponse.json({ images: [], error: 'Failed to fetch images' }, { status: 200 });
  }
}

// POST - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const walletAddress = formData.get('walletAddress') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const folderName = process.env.CLOUDINARY_FOLDER || 'raveculture';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: folderName,
      resource_type: 'image',
      context: walletAddress ? `wallet=${walletAddress}` : undefined,
    });

    return NextResponse.json({
      id: result.asset_id,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
