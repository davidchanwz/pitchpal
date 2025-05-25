import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/server/supabase-server";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello from Next.js API!' });
}

export async function POST(request: NextRequest) {
  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Generate a UUID for the file and use as filename
  const uuid = uuidv4();
  const filename = uuid + '.pptx';

  // Optionally, get user_id from session or request (placeholder below)
  const user_id = formData.get('user_id') || null; // Replace with real user ID logic

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabaseServer.storage
    .from('slides')
    .upload(filename, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert record into slides table
  const { error: dbError } = await supabaseServer
    .from('slides')
    .insert([
      {
        id: uuid,
        user_id: user_id,
        file_name: file.name,
        bucket_location: uploadData.path,
      },
    ]);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: uuid, path: uploadData.path });
}