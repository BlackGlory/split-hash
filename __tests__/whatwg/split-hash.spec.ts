import { splitHash } from '@whatwg/split-hash.js'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleWHATWGStream, createWHATWGHextHash } from '@test/utils.js'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list.js'
import './polyfill'

describe('splitHash', () => {
  test.each([
    [128, hashList128KiB] // 8 same size parts
  , [150, hashList150KiB] // 6 same size parts, 1 smaller than others.
  ])('%sKiB sample', async (blockSizeKiB, hashList) => {
    const stream = getSampleWHATWGStream() as ReadableStream<unknown>
    const blockSizeBytes = blockSizeKiB * KiB

    const iter = splitHash(stream, blockSizeBytes, createWHATWGHextHash)
    const result = await toArrayAsync(iter)

    expect(result).toStrictEqual(hashList)
  })
})
