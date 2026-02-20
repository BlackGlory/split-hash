import { assert, CustomError } from '@blackglory/errors'
import { ProgressiveHashFactory } from './types.js'

export async function* splitHash<T>(
  stream: NodeJS.ReadableStream
, blockSizeBytes: number
, createHash: ProgressiveHashFactory<T>
): AsyncIterableIterator<T> {
  assert(blockSizeBytes > 0, 'The parameter blockSizeBytes must be greater than zero')

  let hash = createHash()
  let currentBlockBytes = 0
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk)) throw new StreamEncodingError()

    if (currentBlockBytes + chunk.length < blockSizeBytes) {
      hash.update(chunk)
      currentBlockBytes += chunk.length
    } else {
      let offset = 0
      while (true) {
        const remainingBlockBytes = blockSizeBytes - currentBlockBytes
        const slice = chunk.slice(offset, offset + remainingBlockBytes)
        if (slice.length === remainingBlockBytes) {
          hash.update(slice)
          const digest = hash.digest()
          yield digest
          // prepare for the next round
          hash = createHash()
          currentBlockBytes = 0
          offset += slice.length
        } else {
          // if the length does not match, the remaining data is not long enough, update the remaining data and exit the loop.
          hash.update(slice)
          currentBlockBytes += slice.length
          break
        }
      }
    }
  }
  // digest remaining data if it exists
  if (currentBlockBytes > 0) yield hash.digest()
}

export class StreamEncodingError extends CustomError {
  constructor() {
    super('stream encoding must not be set')
  }
}
