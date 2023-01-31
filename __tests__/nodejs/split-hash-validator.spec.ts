import { SplitHashValidator, NotMatchedError } from '@nodejs/split-hash-validator'
import { KiB, getSampleBuffer, getSampleNodeJSStream, createNodeJSHexHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'
import { go } from '@blackglory/prelude'

describe('SplitHashValidator', () => {
  describe.each([
    [128, hashList128KiB] // 8 same size parts
  , [150, hashList150KiB] // 6 same size parts, 1 smaller than others.
  ])('%sKiB sample', (blockSizeKiB, hashList) => {
    test('correct hash list', done => {
      go(async () => {
        const buffer = await getSampleBuffer()
        const stream = getSampleNodeJSStream()
        hashList = hashList.slice()
        const blockSizeBytes = blockSizeKiB * KiB

        const validator = new SplitHashValidator(
          hashList
        , blockSizeBytes
        , createNodeJSHexHash
        )
        const output: number[] = []
        stream
          .pipe(validator)
          .on('data', chunk => output.push(...chunk))
          .on('error', e => done(e))
          .on('end', () => {
            if (buffer.every((x, i) => output[i] === x)) {
              done()
            } else {
              done('error')
            }
          })
      })
    })

    test('wrong hash list', done => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice()
      hashList[0] = ''
      const blockSizeBytes = blockSizeKiB * KiB

      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )
      stream
        .pipe(validator)
        .on('error', err => {
          expect(err).toBeInstanceOf(NotMatchedError)
          done()
        })
        .resume()
    })

    test('insufficient hash list', done => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice(0, hashList.length - 1)
      const blockSizeBytes = blockSizeKiB * KiB

      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )
      stream
        .pipe(validator)
        .on('error', err => {
          expect(err).toBeInstanceOf(NotMatchedError)
          done()
        })
        .resume()
    })

    test('excessive hash list', done => {
      const stream = getSampleNodeJSStream()
      hashList = hashList.slice()
      hashList.push(hashList[0])
      const blockSizeBytes = blockSizeKiB * KiB

      const validator = new SplitHashValidator(
        hashList
      , blockSizeBytes
      , createNodeJSHexHash
      )
      stream
        .pipe(validator)
        .on('error', err => {
          expect(err).toBeInstanceOf(NotMatchedError)
          done()
        })
        .resume()
    })
  })
})
