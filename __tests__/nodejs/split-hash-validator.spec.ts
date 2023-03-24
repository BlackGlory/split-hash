import { SplitHashValidator, NotMatchedError } from '@nodejs/split-hash-validator.js'
import { KiB, getSampleBuffer, getSampleNodeJSStream, createNodeJSHexHash, bufferToBytes } from '@test/utils.js'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list.js'
import { toArrayAsync } from 'iterable-operator'
import { getErrorAsync } from 'return-style'

describe('SplitHashValidator', () => {
  describe.each([
    [128, hashList128KiB] // 8 same size parts
  , [150, hashList150KiB] // 6 same size parts, 1 smaller than others.
  ])('%sKiB sample', (blockSizeKiB, hashList) => {
    test('correct hash list', async () => {
      const buffer = await getSampleBuffer()
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice()
      const blockSizeBytes = blockSizeKiB * KiB
      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )

      const chunks = await toArrayAsync(stream.pipe(validator))
      const result = chunks.flatMap(chunk => bufferToBytes(chunk))

      expect(result).toStrictEqual(bufferToBytes(buffer))
    })

    test('wrong hash list', async () => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice()
      hashList[0] = ''
      const blockSizeBytes = blockSizeKiB * KiB
      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )

      const err = await getErrorAsync(() => toArrayAsync(stream.pipe(validator)))

      expect(err).toBeInstanceOf(NotMatchedError)
    })

    test('insufficient hash list', async () => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice(0, hashList.length - 1)
      const blockSizeBytes = blockSizeKiB * KiB
      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )

      const err = await getErrorAsync(() => toArrayAsync(stream.pipe(validator)))

      expect(err).toBeInstanceOf(NotMatchedError)
    })

    test('excessive hash list', async () => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice()
      hashList.push(hashList[0])
      const blockSizeBytes = blockSizeKiB * KiB
      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )

      const err = await getErrorAsync(() => toArrayAsync(stream.pipe(validator)))

      expect(err).toBeInstanceOf(NotMatchedError)
    })
  })
})
