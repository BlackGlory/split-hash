import { getErrorAsyncIterable } from 'return-style'
import { splitHash, StreamEncodingError } from '@nodejs/split-hash'
import { toArrayAsync } from 'iterable-operator'
import { KiB, getSampleNodeJSStream, createNodeJSHexHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'

describe('splitHash', () => {
  test.each([
    [128, hashList128KiB] // 8 same size parts
  , [150, hashList150KiB] // 6 same size parts, 1 smaller than others.
  ])('%sKiB sample', async (blockSizeKiB, hashList) => {
    const stream = getSampleNodeJSStream()
    const blockSizeBytes = blockSizeKiB * KiB

    const iter = splitHash(stream, blockSizeBytes, createNodeJSHexHash)
    const result = await toArrayAsync(iter)

    expect(result).toStrictEqual(hashList)
  })

  test('wrong stream encoding', async () => {
    const stream = getSampleNodeJSStream()
    stream.setEncoding('hex')
    const blockSize = 1 * KiB

    const iter = splitHash(stream, blockSize, createNodeJSHexHash)
    const error = await getErrorAsyncIterable(iter)

    expect(error).toBeInstanceOf(StreamEncodingError)
  })
})
