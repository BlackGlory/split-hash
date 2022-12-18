import { splitHash } from '@whatwg/split-hash'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleWHATWGStream, createWHATWGHextHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'
import './polyfill'

describe('splitHash', () => {
  // 8 same size parts
  describe('128KiB sample', () => {
    it('split and hash sample', async () => {
      const stream = getSampleWHATWGStream()
      const blockSize = 128 * KiB

      const iter = splitHash(stream, blockSize, createWHATWGHextHash)
      const result = await toArrayAsync(iter)

      expect(result).toStrictEqual(hashList128KiB)
    })
  })

  // 6 same size parts, 1 smaller than others.
  describe('150KiB sample', () => {
    it('split and hash', async () => {
      const stream = getSampleWHATWGStream()
      const blockSize = 150 * KiB

      const iter = splitHash(stream, blockSize, createWHATWGHextHash)
      const result = await toArrayAsync(iter)

      expect(result).toStrictEqual(hashList150KiB)
    })
  })
})
