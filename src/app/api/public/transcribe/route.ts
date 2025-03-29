import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    const response = await openai.audio.transcriptions.create({
        file: file,
        // TODO: figure out why gpt-4o-mini-transcribe is not working
        // returns "model does not support format"
        model: "whisper-1",
        response_format: "text",
        // stream: true,
        language: "nl",
    });

    return NextResponse.json({ 
      text: response
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  }
}