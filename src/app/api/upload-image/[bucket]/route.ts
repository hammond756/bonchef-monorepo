import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ bucket: string }> }) {
  try {
    const supabase = await createClient()
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("image") as File
    const bucket = (await params).bucket

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Generate a unique filename with user ID in the path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Error uploading to Supabase:", error)
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      )
    }

    // Get the signed URL for the uploaded file
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600) // URL expires in 1 hour

    if (!signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: signedUrlData.signedUrl })
  } catch (error) {
    console.error("Error in upload-image route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 