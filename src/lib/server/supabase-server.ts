import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client that is never exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role key for server operations

// This client should only be used in API routes, never in client components
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);