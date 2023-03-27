import { CustomError } from '@blackglory/errors'
import { ProgressiveHashFactory } from './types.js'

export async function* splitHash<T>(
  stream: NodeJS.ReadableStream
, blockSizeBytes: number
, createHash: ProgressiveHashFactory<T>
): AsyncIterableIterator<T> {
  let hash = createHash()
  let accu = 0
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk)) throw new StreamEncodingError()
    if (accu + chunk.length < blockSizeBytes) {
      hash.update(chunk)
      accu += chunk.length
    } else {
      let offset = 0
      while (true) {
        const needed = blockSizeBytes - accu
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

export class StreamEncodingError extends CustomError {
  constructor() {
    super('stream encoding must not be set')
  }
}
