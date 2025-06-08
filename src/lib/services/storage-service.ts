import { SupabaseClient } from "@supabase/supabase-js";

export class StorageService {
  constructor(private supabase: SupabaseClient) {}

  async uploadImage(
    bucket: string,
    image: File,
    isPublic: boolean,
    filePath: string
  ): Promise<string> {

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (error || !data) {
      throw new Error(error?.message || "Failed to upload image");
    }

    if (isPublic) {
      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }
      return publicUrlData.publicUrl;
    } else {
      const { data: signedUrlData, error: signedUrlError } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600);
      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw new Error(signedUrlError?.message || "Failed to generate signed URL");
      }
      return signedUrlData.signedUrl;
    }
  }

  async getSignedUploadUrl(bucket: string, filePath: string): Promise<{ signedUrl: string, path: string, token: string }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message || "Failed to generate signed URL");
    }
    return data
  }

  async uploadToSignedUrl(bucket: string, filePath: string, file: File, token: string): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .uploadToSignedUrl(filePath, token, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(error?.message || "Failed to upload to signed URL");
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }
    return publicUrlData.publicUrl;
  }
}