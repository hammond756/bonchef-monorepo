import { Allow, parse } from "partial-json"
import { LLMResponse } from "./types"

/**
 * Processes streaming data from a LangChain event stream.
 * This utility extracts content from different types of chunk formats.
 */
export function extractContentFromChunk(chunk: any): string {
  let content = ""

  // Handle different chunk formats
  if (chunk.kwargs && chunk.kwargs.tool_call_chunks && chunk.kwargs.tool_call_chunks.length > 0) {
    // Looks like output from gpt-4o with json_schema model
    content = chunk.kwargs.tool_call_chunks[0].args
  } else if (chunk.kwargs && chunk.kwargs.content) {
    // Looks like output from gpt-4o with function_calling mode
    content = chunk.kwargs.content
  }

  return content
}

/**
 * Handles JSON content accumulation and parsing for LLM responses.
 * Returns the parsed response once it's complete enough to parse.
 */
export function processAccumulatedContent(accumulatedJson: string): LLMResponse | null {
  try {
    // Try to parse the accumulated JSON as a complete LLMResponse
    const parsedResponse = parse(accumulatedJson, Allow.ALL) as LLMResponse
    
    // If we have a valid messages array, return the parsed response
    if (parsedResponse && parsedResponse.messages && Array.isArray(parsedResponse.messages)) {
      return parsedResponse
    }
  } catch (jsonError) {
    // If we can't parse the accumulated JSON yet, it's incomplete
    console.log("Accumulating JSON chunks...")
  }

  return null
}

/**
 * Creates a streaming request handler that processes events from a LangChain event stream.
 * 
 * @param url API endpoint to stream from
 * @param requestBody Request body to send to the API
 * @param callbacks Callbacks for handling different stream events
 * @returns A promise that resolves when the stream completes
 */
export interface StreamCallbacks<T> {
  onLoading?: (isLoading: boolean) => void;
  onChunkReceived?: (parsedResponse: T | null, accumulatedJson: string) => void;
  onStreamComplete?: (finalResponse: T) => void;
  onError?: (error: Error) => void;
}

export async function createStreamingRequest<T>(
  url: string, 
  requestBody: any, 
  callbacks: StreamCallbacks<T>
) {
  const { fetchEventSource } = await import("@microsoft/fetch-event-source")
  
  // For accumulating partial JSON chunks
  let accumulatedJson = ""
  let streamComplete = false
  
  try {
    await fetchEventSource(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      openWhenHidden: true,
      body: typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody),
      onmessage: (message) => {
        if (message.event === "data") {
          try {
            const data = JSON.parse(message.data)
            
            if (data.event === "on_chat_model_stream") {
              if (callbacks.onLoading) {
                callbacks.onLoading(false)
              }
              
              // Extract the chunk content
              if (data.data.chunk) {
                try {
                  // Get the raw chunk data
                  const chunk = data.data.chunk
                  const content = extractContentFromChunk(chunk)
                  
                  // Accumulate the content
                  accumulatedJson += content
                  
                  // Try to parse the accumulated content
                  const parsedResponse = processAccumulatedContent(accumulatedJson) as T
                  
                  // Call the chunk callback with the parsed response
                  if (callbacks.onChunkReceived) {
                    callbacks.onChunkReceived(parsedResponse, accumulatedJson)
                  }
                } catch (error) {
                  console.error("Error processing chunk:", error)
                }
              }
            } else if (data.event === "on_llm_end" || data.event === "on_chain_end") {
              // Mark the stream as complete when we receive the end event
              streamComplete = true
              console.log("Stream completed successfully")
              
              const finalResponse = data.data.output as T
              
              if (callbacks.onStreamComplete) {
                callbacks.onStreamComplete(finalResponse)
              }
            }
          } catch (parseError) {
            console.error("Error parsing message data:", parseError)
          }
        }
      },
      onclose: () => {
        console.log("Stream closed")
        if (!streamComplete) {
          // If the stream closed unexpectedly, we should notify
          console.warn("Stream closed before completion")
        }
      },
      onerror: (err) => {
        console.error("Error in event source:", err)
        if (callbacks.onError) {
          callbacks.onError(new Error("Failed to process streaming request"))
        } else {
          throw new Error("Failed to process streaming request")
        }
      },
    })
  } catch (error) {
    console.error("Error in streaming request:", error)
    if (callbacks.onError) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    } else {
      throw error
    }
  }
}