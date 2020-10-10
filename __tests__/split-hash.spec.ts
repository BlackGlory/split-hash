import { getErrorAsyncIterable } from 'return-style'
import { splitHash, StreamEncodingError } from '@src/split-hash'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleStream, createHexHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'
import '@blackglory/jest-matchers'

describe('splitHash', () => {
  describe('encoding stream', () => {
    it('throw StreamEncodingError', async () => {
      const stream = getSampleStream()
      stream.setEncoding('hex')
      const blockSize = 1 * KiB

      const result = splitHash(stream, blockSize, createHexHash)
      const error = await getErrorAsyncIterable(result)

      expect(result).toBeAsyncIterable()
      expect(error).toBeInstanceOf(StreamEncodingError)
    })
  })

  // 8 same size parts
  describe('128KiB sample', () => {
    it('split and hash sample', async () => {
      const stream = getSampleStream()
      const blockSize = 128 * KiB

      const result = splitHash(stream, blockSize, createHexHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList128KiB)
    })
  })

  // 6 same size parts, 1 smaller than others.
  describe('150KiB sample', () => {
    it('split and hash', async () => {
      const stream = getSampleStream()
      const blockSize = 150 * KiB

      const result = splitHash(stream, blockSize, createHexHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList150KiB)
    })
  })
})
