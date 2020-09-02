export type ProgressiveHashFactory<T> = () => ProgressiveHash<T>

export interface ProgressiveHash<T> {
  update(buffer: Buffer): void
  digest(): T
}

export async function* splitHash<T>(stream: NodeJS.ReadableStream, blockSize: number, createHash: ProgressiveHashFactory<T>): AsyncIterable<T> {
  let hash = createHash()
  let accu = 0
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk)) throw new StreamEncodingError()
    if (accu + chunk.length < blockSize) {
      hash.update(chunk)
      accu += chunk.length
    } else {
      let offset = 0
      while (true) {
        const needed = blockSize - accu
        const slice = chunk.slice(offset, offset + needed)
        if (slice.length === needed) {
          hash.update(slice)
          const digest = hash.digest()
          yield digest
          // prepare for the next round
          hash = createHash()
          accu = 0
          offset += slice.length
        } else {
          // if the length does not match, the remaining data is not long enough, update the remaining data and exit the loop.
          hash.update(slice)
          accu += slice.length
          break
        }
      }
    }
  }
  // digest remaining data if it exists
  if (accu > 0) yield hash.digest()
}

export class StreamEncodingError extends Error {
  name = this.constructor.name

  constructor() {
    super('stream encoding must not be set.')
  }
}
