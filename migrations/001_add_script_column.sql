-- Add script and extracted_content columns to slides table
-- Run this in your Supabase SQL editor or migration tool

ALTER TABLE public.slides 
ADD COLUMN script TEXT,
ADD COLUMN extracted_content JSONB,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add an index for better performance when querying scripts
CREATE INDEX idx_slides_script ON public.slides(id) WHERE script IS NOT NULL;
CREATE INDEX idx_slides_extracted_content ON public.slides USING GIN (extracted_content);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_slides_updated_at 
    BEFORE UPDATE ON public.slides 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the columns
COMMENT ON COLUMN public.slides.script IS 'Generated AI script content for the presentation slides';
COMMENT ON COLUMN public.slides.extracted_content IS 'Extracted slide content as JSON from PPTX parsing';
COMMENT ON COLUMN public.slides.updated_at IS 'Timestamp when the record was last updated';
