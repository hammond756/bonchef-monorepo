/**
 * Converts a readable stream into a buffer.
 * @param {ReadableStream<Uint8Array>} stream - The stream to convert.
 * @returns {Promise<Buffer>} A promise that resolves with the buffer.
 */
export async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            break
        }
        chunks.push(value)
    }

    return Buffer.concat(chunks)
}
