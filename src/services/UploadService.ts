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
}
