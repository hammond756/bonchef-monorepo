import { createClient } from "@/utils/supabase/client"
import { transcribeAudioWithClient, SpeechTranscriptionOptions } from "./shared"

export const transcribeAudio = (base64Audio: string, options?: SpeechTranscriptionOptions) => {
    const supabase = createClient()
    return transcribeAudioWithClient(supabase, base64Audio, options)
}
