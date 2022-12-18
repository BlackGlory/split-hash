import { getErrorAsyncIterable } from 'return-style'
import { splitHash, StreamEncodingError } from '@nodejs/split-hash'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleNodeJSStream, createNodeJSHexHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'

describe('splitHash', () => {
  describe('encoding stream', () => {
    it('throw StreamEncodingError', async () => {
      const stream = getSampleNodeJSStream()
      stream.setEncoding('hex')
      const blockSize = 1 * KiB

      const iter = splitHash(stream, blockSize, createNodeJSHexHash)
      const error = await getErrorAsyncIterable(iter)

      expect(error).toBeInstanceOf(StreamEncodingError)
    })
  })

  // 8 same size parts
  describe('128KiB sample', () => {
    it('split and hash sample', async () => {
      const stream = getSampleNodeJSStream()
      const blockSize = 128 * KiB

      const iter = splitHash(stream, blockSize, createNodeJSHexHash)
      const result = await toArrayAsync(iter)

      expect(result).toStrictEqual(hashList128KiB)
    })
  })

  // 6 same size parts, 1 smaller than others.
  describe('150KiB sample', () => {
    it('split and hash', async () => {
      const stream = getSampleNodeJSStream()
      const blockSize = 150 * KiB

      const iter = splitHash(stream, blockSize, createNodeJSHexHash)
      const result = await toArrayAsync(iter)

      expect(result).toStrictEqual(hashList150KiB)
    })
  })
})
