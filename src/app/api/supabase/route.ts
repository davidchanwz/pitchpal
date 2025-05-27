import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('user_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Generate unique filename
    const filename = `${userId}_${Date.now()}_${file.name}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('slides')
      .upload(filename, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Create record in slides table
    const { error: dbError } = await supabase
      .from('slides')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          storage_path: uploadData.path,
          upload_date: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Upload successful',
      path: uploadData.path,
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
