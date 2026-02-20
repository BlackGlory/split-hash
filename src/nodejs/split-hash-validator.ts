import { Transform, TransformCallback } from 'stream'
import { assert, CustomError } from '@blackglory/errors'
import { ProgressiveHashFactory, IProgressiveHash } from './types.js'
import { isUndefined } from 'extra-utils'

export class SplitHashValidator<T> extends Transform {
  private hash: IProgressiveHash<T> = this.createHash()
  private currentBlockBytes = 0
  private digestIndex = 0

  constructor(
    private digests: T[]
  , private blockSizeBytes: number
  , private createHash: ProgressiveHashFactory<T>
  , private equals: (a: T, b: T) => boolean = Object.is
  ) {
    assert(blockSizeBytes > 0, 'The parameter blockSizeBytes must be greater than zero')

    super()
  }

  _transform(
    // 总是Buffer
    chunk: Buffer
    // 总是"buffer".
  , encoding: BufferEncoding
  , callback: TransformCallback
  ): void {
    // 由于接收到的chunk总是Buffer, 且encoding总是"buffer", 无法在此处检测chunk是否经过编码.

    if (this.currentBlockBytes + chunk.length < this.blockSizeBytes) {
      this.hash.update(chunk)
      this.currentBlockBytes += chunk.length
    } else {
      let offset = 0
      while (true) {
        const remainingBlockBytes = this.blockSizeBytes - this.currentBlockBytes
        const slice = chunk.slice(offset, offset + remainingBlockBytes)
        if (slice.length === remainingBlockBytes) {
          this.hash.update(slice)
          const currentBlockBytes = this.hash.digest()
          const correctDigest = this.digests[this.digestIndex]
          if (
            isUndefined(correctDigest) ||
            !this.equals(correctDigest, currentBlockBytes)
          ) {
            return callback(new NotMatchedError())
          }

          this.digestIndex++

          // prepare for the next round
          this.hash = this.createHash()
          this.currentBlockBytes = 0
          offset += slice.length
        } else {
          // if the length does not match, the remaining data is not long enough, update the remaining data and exit the loop.
          this.hash.update(slice)
          this.currentBlockBytes += slice.length
          break
        }
      }
    }

    callback(null, chunk)
  }

  _flush(callback: TransformCallback): void {
    if (this.currentBlockBytes > 0) {
      const currentBlockDigest = this.hash.digest()
      const correctDigest = this.digests[this.digestIndex]
      if (
        isUndefined(correctDigest) ||
        !this.equals(correctDigest, currentBlockDigest)
      ) {
        return callback(new NotMatchedError())
      }
      this.digestIndex++
    }

    if (this.digestIndex !== this.digests.length) {
      return callback(new NotMatchedError())
    }

    callback()
  }
}

export class NotMatchedError extends CustomError {
  constructor() {
    super('hashes do not match')
  }
}
