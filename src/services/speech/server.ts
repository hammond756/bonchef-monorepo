import { createClient } from "@/utils/supabase/server"
import {
    transcribeAudioWithClient,
    transcribeBase64AudioWithClient,
    SpeechTranscriptionOptions,
} from "./shared"

export const transcribeAudio = async (audioUrl: string, options?: SpeechTranscriptionOptions) => {
    const supabase = await createClient()
    return transcribeAudioWithClient(supabase, audioUrl, options)
}

export const transcribeBase64Audio = async (
    base64Audio: string,
    options?: SpeechTranscriptionOptions
) => {
    const supabase = await createClient()
    return transcribeBase64AudioWithClient(supabase, base64Audio, options)
}
