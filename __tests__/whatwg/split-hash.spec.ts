import { splitHash } from '@whatwg/split-hash'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleWHATWGStream, createWHATWGHextHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'
import './polyfill'
import '@blackglory/jest-matchers'

describe('splitHash', () => {
  // 8 same size parts
  describe('128KiB sample', () => {
    it('split and hash sample', async () => {
      const stream = getSampleWHATWGStream()
      const blockSize = 128 * KiB

      const result = splitHash(stream, blockSize, createWHATWGHextHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList128KiB)
    })
  })

  // 6 same size parts, 1 smaller than others.
  describe('150KiB sample', () => {
    it('split and hash', async () => {
      const stream = getSampleWHATWGStream()
      const blockSize = 150 * KiB

      const result = splitHash(stream, blockSize, createWHATWGHextHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList150KiB)
    })
  })
})
