import { SupabaseClient } from "@supabase/supabase-js"

export interface UploadResult {
    path: string
    url: string
}

export async function uploadObjectWithClient(
    client: SupabaseClient,
    bucket: string,
    filePath: string,
    file: File
): Promise<UploadResult> {
    const { data, error } = await client.storage.from(bucket).upload(filePath, file)
    if (error) {
        throw new Error(error.message)
    }

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath)
    if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL")
    }

    return {
        path: data.fullPath,
        url: publicUrlData.publicUrl,
    }
}
