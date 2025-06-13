import { createClient } from "@/utils/supabase/server"
import { StorageService } from "@/lib/services/storage-service"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ bucket: string }> }) {
    try {
        const supabase = await createClient()
        const storageService = new StorageService(supabase)
        // Get the current user
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("image") as File
        const isPublic = formData.get("isPublic") === "true" || false
        const bucket = (await params).bucket

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Generate a unique filename with user ID in the path
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const url = await storageService.uploadImage(bucket, file, isPublic, filePath)

        return NextResponse.json({ url })
    } catch (error) {
        console.error("Error in upload-image route:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
