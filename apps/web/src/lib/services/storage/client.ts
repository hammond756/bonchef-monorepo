import { createClient } from "@/utils/supabase/client"
import { uploadObjectWithClient, UploadResult } from "./shared"
import { v4 as uuidv4 } from "uuid"

export async function uploadRecipeImage(file: File): Promise<UploadResult> {
    const supabase = await createClient()
    const filePath = `${uuidv4()}.${file.name.split(".").pop()}`
    return await uploadObjectWithClient(supabase, "recipe-images", filePath, file)
}

export async function uploadDishcoveryImage(
    file: File,
    prefix: string = ""
): Promise<UploadResult> {
    const supabase = await createClient()
    const filePath = prefix
        ? `${prefix}/image.${file.name.split(".").pop()}`
        : `${uuidv4()}.${file.name.split(".").pop()}`
    return await uploadObjectWithClient(supabase, "dishcovery-assets", filePath, file)
}

export async function uploadDishcoveryAudio(
    file: File,
    prefix: string = ""
): Promise<UploadResult> {
    const supabase = await createClient()
    const filePath = prefix
        ? `${prefix}/audio.${file.name.split(".").pop()}`
        : `${uuidv4()}.${file.name.split(".").pop()}`
    return await uploadObjectWithClient(supabase, "dishcovery-assets", filePath, file)
}
