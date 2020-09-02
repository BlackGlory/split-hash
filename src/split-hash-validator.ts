import { ProgressiveHashFactory, ProgressiveHash } from '@src/types'
import { Transform, TransformCallback } from 'stream'

export class SplitHashValidator<T> extends Transform {
  #digests: T[]
  #blockSize: number
  #createHash: ProgressiveHashFactory<T>
  #hash: ProgressiveHash<T>
  #equals: (a: T, b: T) => boolean
  #accu = 0
  #digestIndex = 0

  constructor(
    digests: T[]
  , blockSize: number
  , createHash: ProgressiveHashFactory<T>
  , equals: (a: T, b: T) => boolean = Object.is
  ) {
    super()

    this.#digests = digests
    this.#blockSize = blockSize
    this.#createHash = createHash
    this.#hash = this.#createHash()
    this.#equals = equals
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    // chunk is always Buffer, encoding is always 'buffer', so there is no need to check

    if (this.#accu + chunk.length < this.#blockSize) {
      this.#hash.update(chunk)
      this.#accu += chunk.length
    } else {
      let offset = 0
      while (true) {
        const needed = this.#blockSize - this.#accu
        const slice = chunk.slice(offset, offset + needed)
        if (slice.length === needed) {
          this.#hash.update(slice)
          const digest = this.#hash.digest()
          if (!this.#equals(this.#digests[this.#digestIndex], digest)) {
            return callback(new NotMatchedError())
          }
          this.#digestIndex++
          // prepare for the next round
          this.#hash = this.#createHash()
          this.#accu = 0
          offset += slice.length
        } else {
          // if the length does not match, the remaining data is not long enough, update the remaining data and exit the loop.
          this.#hash.update(slice)
          this.#accu += slice.length
          break
        }
      }
    }

    callback(null, chunk)
  }

  _flush(callback: TransformCallback): void {
    if (this.#accu > 0) {
      const digest = this.#hash.digest()
      if (!this.#equals(this.#digests[this.#digestIndex], digest)) {
        return callback(new NotMatchedError())
      }
      this.#digestIndex++
    }

    if (this.#digestIndex !== this.#digests.length) {
      return callback(new NotMatchedError())
    }

    callback()
  }
}

export class NotMatchedError extends Error {
  name = this.constructor.name

  constructor() {
    super('hashes do not match')
  }
}
