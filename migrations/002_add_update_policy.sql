-- Add RLS UPDATE policy for slides table
-- This allows users to update slides they own

-- Enable RLS on slides table (if not already enabled)
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Create UPDATE policy - users can update their own slides
CREATE POLICY "Users can update own slides" ON slides
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: Also add DELETE policy if needed
-- CREATE POLICY "Users can delete own slides" ON slides
--   FOR DELETE
--   USING (auth.uid() = user_id);
