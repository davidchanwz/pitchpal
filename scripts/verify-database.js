// Database verification script
// Run this to check if the migration was applied correctly
// Usage: node scripts/verify-database.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
    console.log('🔍 Verifying database structure...');

    try {
        // Check if the slides table exists and get its structure
        const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', {
            table_name: 'slides'
        });

        if (tableError) {
            console.log('ℹ️ Using alternative method to check table structure...');

            // Alternative: Try to select from the table to see what columns exist
            const { data: sampleData, error: selectError } = await supabase
                .from('slides')
                .select('*')
                .limit(1);

            if (selectError) {
                console.error('❌ Error querying slides table:', selectError.message);
                if (selectError.message.includes('column') && selectError.message.includes('does not exist')) {
                    console.log('💡 This suggests the migration has not been applied yet.');
                    console.log('💡 Please run the migration in your Supabase SQL editor:');
                    console.log('   📁 /Users/davidchan/pitchpal/migrations/001_add_script_column.sql');
                }
                return;
            }

            console.log('✅ Slides table is accessible');
            if (sampleData && sampleData.length > 0) {
                console.log('📊 Sample row structure:', Object.keys(sampleData[0]));

                // Check if our new columns exist
                const columns = Object.keys(sampleData[0]);
                const hasScript = columns.includes('script');
                const hasExtractedContent = columns.includes('extracted_content');
                const hasUpdatedAt = columns.includes('updated_at');

                console.log('🔍 Column check:');
                console.log(`   script: ${hasScript ? '✅' : '❌'}`);
                console.log(`   extracted_content: ${hasExtractedContent ? '✅' : '❌'}`);
                console.log(`   updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

                if (!hasScript || !hasExtractedContent || !hasUpdatedAt) {
                    console.log('');
                    console.log('💡 Missing columns detected. Please run the migration:');
                    console.log('   📁 /Users/davidchan/pitchpal/migrations/001_add_script_column.sql');
                } else {
                    console.log('');
                    console.log('✅ All required columns are present!');
                }
            } else {
                console.log('ℹ️ No data in slides table yet');
            }
        }

        // Try to get a specific slide to see the current data
        console.log('');
        console.log('🔍 Checking for recent slides with content...');

        const { data: slides, error: slidesError } = await supabase
            .from('slides')
            .select('id, file_name, script, extracted_content, updated_at, created_at')
            .order('created_at', { ascending: false })
            .limit(3);

        if (slidesError) {
            console.error('❌ Error fetching slides:', slidesError.message);
        } else if (slides && slides.length > 0) {
            console.log(`📊 Found ${slides.length} recent slides:`);
            slides.forEach((slide, index) => {
                console.log(`   ${index + 1}. ${slide.file_name} (ID: ${slide.id})`);
                console.log(`      Script: ${slide.script ? `${slide.script.length} chars` : 'null'}`);
                console.log(`      Extracted Content: ${slide.extracted_content ?
                    `${Array.isArray(slide.extracted_content) ? slide.extracted_content.length : 'object'} items` : 'null'}`);
                console.log(`      Updated: ${slide.updated_at || 'null'}`);
                console.log('');
            });
        } else {
            console.log('ℹ️ No slides found in database');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

verifyDatabase();
