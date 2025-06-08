import { extractContentFromChunk, processAccumulatedContent } from "./stream-parsers"

export interface StreamCallbacks<T> {
  onData?: (data: T | null) => void;
  onComplete?: (finalData: T) => void;
  onError?: (error: Error) => void;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export class SSEWriter {
  private encoder: TextEncoder
  private controller: ReadableStreamDefaultController | null = null
  private stream: ReadableStream

  constructor() {
    this.encoder = new TextEncoder()
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller
      }
    })
  }

  private writeEvent(data: JsonValue, eventType: "streaming" | "complete") {
    if (!this.controller) {
      throw new Error("Stream controller not initialized")
    }
    const event = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
    this.controller.enqueue(this.encoder.encode(event))
  }

  private close() {
    if (!this.controller) {
      throw new Error("Stream controller not initialized")
    }
    this.controller.close()
  }

  private error(error: Error) {
    if (!this.controller) {
      throw new Error("Stream controller not initialized")
    }
    this.controller.error(error)
  }

  public async writeStream<T extends JsonValue>(
    stream: AsyncIterable<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    callbacks?: StreamCallbacks<T>
  ) {
    let accumulatedJson = ""
    
    try {
      for await (const chunk of stream) {
        try {
          if (chunk.event === "on_chat_model_stream") {
            console.log("on_chat_model_stream", chunk)
            const content = extractContentFromChunk(chunk.data.chunk)
            accumulatedJson += content
            
            // Try to parse the accumulated content
            const parsedResponse = processAccumulatedContent<T>(accumulatedJson)
            
            // Emit the parsed response if available
            if (parsedResponse) {
              this.writeEvent(parsedResponse, "streaming")
              callbacks?.onData?.(parsedResponse)
            }
          } else if (chunk.event === "on_llm_end" || chunk.event === "on_chain_end") {
            console.log("final response", chunk)
            this.writeEvent(chunk.data.output, "complete")
            callbacks?.onComplete?.(chunk.data.output)
            this.close()
          }
        } catch (parseError) {
          console.error("Error processing chunk:", parseError)
          this.error(parseError as Error)
          callbacks?.onError?.(parseError as Error)
          this.close()
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.error(err)
      callbacks?.onError?.(err)
    }
  }

  public getStream(): ReadableStream {
    return this.stream
  }
} 