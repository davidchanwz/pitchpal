import { supabase } from "@/lib/supabase-client";

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    slideId: string;
  };
  error?: string;
}

export class UploadService {
  static async uploadSlide(file: File): Promise<UploadResult> {
    try {
      // Get the current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Generate unique filename with folder structure
      const filename = `${user.id}/${Date.now()}_${file.name}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("slides")
        .upload(filename, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return {
          success: false,
          error: uploadError.message,
        };
      }
      // Create record in slides table
      const { data: slideData, error: dbError } = await supabase
        .from("slides")
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            bucket_location: uploadData.path,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("slides").remove([uploadData.path]);
        return {
          success: false,
          error: dbError.message,
        };
      }

      return {
        success: true,
        data: {
          path: uploadData.path,
          slideId: slideData.id,
        },
      };
    } catch (error) {
      console.error("Upload service error:", error);
      return {
        success: false,
        error: "Internal error occurred",
      };
    }
  }

  static async getUserSlides() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const { data: slides, error: slidesError } = await supabase
        .from("slides")
        .select("*")
        .eq("user_id", user.id)
        .order("upload_date", { ascending: false });

      if (slidesError) {
        return {
          success: false,
          error: slidesError.message,
        };
      }

      return {
        success: true,
        data: slides,
      };
    } catch (error) {
      console.error("Get slides error:", error);
      return {
        success: false,
        error: "Failed to fetch slides",
      };
    }
  }

  static async getSlideUrl(storagePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from("slides")
        .createSignedUrl(storagePath, 3600); // URL valid for 1 hour

      return data?.signedUrl || null;
    } catch (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
  }

  static async deleteSlide(slideId: string, storagePath: string) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from("slides")
        .delete()
        .eq("id", slideId)
        .eq("user_id", user.id); // Ensure user can only delete their own slides

      if (dbError) {
        return {
          success: false,
          error: dbError.message,
        };
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("slides")
        .remove([storagePath]);

      if (storageError) {
        console.warn("Storage deletion error:", storageError);
        // Don't fail the whole operation if storage deletion fails
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Delete slide error:", error);
      return {
        success: false,
        error: "Failed to delete slide",
      };
    }
  }

  static async saveScript(slideId: string, script: string) {
    console.log('📝 [UploadService.saveScript] Starting script save operation...');
    console.log('📝 [UploadService.saveScript] slideId:', slideId);
    console.log('📝 [UploadService.saveScript] script length:', script.length);
    console.log('📝 [UploadService.saveScript] script preview:', script.substring(0, 100) + '...');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log('🔐 [UploadService.saveScript] Auth check completed');
      if (authError) {
        console.error('❌ [UploadService.saveScript] Auth error:', authError);
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      if (!user) {
        console.error('❌ [UploadService.saveScript] No user found');
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      console.log('✅ [UploadService.saveScript] User authenticated:', user.id);

      const { data: updateResult, error: updateError } = await supabase
        .from("slides")
        .update({ script })
        .eq("id", slideId)
        .eq("user_id", user.id)
        .select(); // Add select to return the updated row

      if (updateError) {
        console.error("❌ [UploadService.saveScript] Database update error:", updateError);
        console.error("❌ [UploadService.saveScript] Error details:", JSON.stringify(updateError, null, 2));
        return {
          success: false,
          error: updateError.message,
        };
      }

      console.log('🔍 [UploadService.saveScript] Update result from database:',
        JSON.stringify(updateResult, null, 2));

      // Verify the data was actually saved by querying it back
      const { data: verifyData, error: verifyError } = await supabase
        .from("slides")
        .select("id, script, updated_at")
        .eq("id", slideId)
        .eq("user_id", user.id)
        .single();

      if (verifyError) {
        console.warn("⚠️ [UploadService.saveScript] Verification query failed:", verifyError);
      } else {
        console.log('🔍 [UploadService.saveScript] Verification query result:',
          JSON.stringify(verifyData, null, 2));
      }

      console.log('✅ [UploadService.saveScript] Script saved successfully to database');
      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ [UploadService.saveScript] Unexpected error:", error);
      return {
        success: false,
        error: "Failed to save script",
      };
    }
  }

  static async getScript(slideId: string): Promise<{ success: boolean; script?: string; error?: string }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const { data: slideData, error: fetchError } = await supabase
        .from("slides")
        .select("script")
        .eq("id", slideId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        console.error("Script fetch error:", fetchError);
        return {
          success: false,
          error: fetchError.message,
        };
      }

      return {
        success: true,
        script: slideData.script || undefined,
      };
    } catch (error) {
      console.error("Get script error:", error);
      return {
        success: false,
        error: "Failed to fetch script",
      };
    }
  }

  static async updateSlideWithExtractedContent(slideId: string, extractedSlides: any[]) {
    console.log('📊 [UploadService.updateSlideWithExtractedContent] Starting extracted content save...');
    console.log('📊 [UploadService.updateSlideWithExtractedContent] slideId:', slideId);
    console.log('📊 [UploadService.updateSlideWithExtractedContent] extractedSlides count:', extractedSlides.length);
    console.log('📊 [UploadService.updateSlideWithExtractedContent] extractedSlides preview:',
      JSON.stringify(extractedSlides.slice(0, 2), null, 2)); // Show first 2 slides

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log('🔐 [UploadService.updateSlideWithExtractedContent] Auth check completed');
      if (authError) {
        console.error('❌ [UploadService.updateSlideWithExtractedContent] Auth error:', authError);
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      if (!user) {
        console.error('❌ [UploadService.updateSlideWithExtractedContent] No user found');
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      console.log('✅ [UploadService.updateSlideWithExtractedContent] User authenticated:', user.id);

      // Store the extracted slides data as JSON
      const updateData = {
        extracted_content: extractedSlides,
        updated_at: new Date().toISOString(),
      };

      console.log('🔍 [UploadService.updateSlideWithExtractedContent] Update data being sent:',
        JSON.stringify(updateData, null, 2));

      const { data: updateResult, error: updateError } = await supabase
        .from("slides")
        .update(updateData)
        .eq("id", slideId)
        .eq("user_id", user.id)
        .select(); // Add select to return the updated row

      if (updateError) {
        console.error("❌ [UploadService.updateSlideWithExtractedContent] Database update error:", updateError);
        console.error("❌ [UploadService.updateSlideWithExtractedContent] Error details:", JSON.stringify(updateError, null, 2));
        return {
          success: false,
          error: updateError.message,
        };
      }

      console.log('🔍 [UploadService.updateSlideWithExtractedContent] Update result from database:',
        JSON.stringify(updateResult, null, 2));

      // Verify the data was actually saved by querying it back
      const { data: verifyData, error: verifyError } = await supabase
        .from("slides")
        .select("id, extracted_content, updated_at")
        .eq("id", slideId)
        .eq("user_id", user.id)
        .single();

      if (verifyError) {
        console.warn("⚠️ [UploadService.updateSlideWithExtractedContent] Verification query failed:", verifyError);
      } else {
        console.log('🔍 [UploadService.updateSlideWithExtractedContent] Verification query result:',
          JSON.stringify(verifyData, null, 2));
      }

      console.log('✅ [UploadService.updateSlideWithExtractedContent] Extracted content saved successfully to database');
      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ [UploadService.updateSlideWithExtractedContent] Unexpected error:", error);
      return {
        success: false,
        error: "Failed to update slide content",
      };
    }
  }

  static async verifyDatabaseSchema() {
    console.log('🔍 [UploadService.verifyDatabaseSchema] Checking database schema...');

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('❌ [UploadService.verifyDatabaseSchema] User not authenticated');
        return { success: false, error: "User not authenticated" };
      }

      // Try to select all columns from a sample slide
      const { data: sampleData, error: selectError } = await supabase
        .from('slides')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (selectError) {
        console.error('❌ [UploadService.verifyDatabaseSchema] Error querying slides table:', selectError);
        if (selectError.message.includes('column') && selectError.message.includes('does not exist')) {
          console.log('💡 [UploadService.verifyDatabaseSchema] Migration may not have been applied yet');
        }
        return { success: false, error: selectError.message };
      }

      if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        console.log('📊 [UploadService.verifyDatabaseSchema] Available columns:', columns);

        const hasScript = columns.includes('script');
        const hasExtractedContent = columns.includes('extracted_content');
        const hasUpdatedAt = columns.includes('updated_at');

        console.log('🔍 [UploadService.verifyDatabaseSchema] Required columns check:');
        console.log(`   script: ${hasScript ? '✅' : '❌'}`);
        console.log(`   extracted_content: ${hasExtractedContent ? '✅' : '❌'}`);
        console.log(`   updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

        return {
          success: true,
          data: {
            columns,
            hasScript,
            hasExtractedContent,
            hasUpdatedAt,
            allColumnsPresent: hasScript && hasExtractedContent && hasUpdatedAt
          }
        };
      } else {
        console.log('ℹ️ [UploadService.verifyDatabaseSchema] No slides found for user');
        return { success: true, data: { columns: [], message: 'No slides found' } };
      }

    } catch (error) {
      console.error('❌ [UploadService.verifyDatabaseSchema] Unexpected error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}
