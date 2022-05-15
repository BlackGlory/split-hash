import { SplitHashValidator, NotMatchedError } from '@src/split-hash-validator'
import { KiB, getSampleBuffer, getSampleStream, createHexHash } from '@test/utils'
import { hashList128KiB, hashList150KiB } from '@test/fixtures/hash-list'
import { go } from '@blackglory/prelude'

describe('SplitHashValidator', () => {
  // 8 same size parts
  describe('128KiB sample', () => {
    describe('correct hash list', () => {
      it('pass', done => {
        const stream = getSampleStream()
        const hashList = hashList128KiB
        const blockSize = 128 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', e => done(e))
          .on('end', () => done())
          .resume()
      })

      it('return same data', done => {
        go(async () => {
          const buffer = await getSampleBuffer()
          const stream = getSampleStream()
          const hashList = hashList128KiB
          const blockSize = 128 * KiB

          const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
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
    })

    describe('wrong hash list', () => {
      it('pass', done => {
        const stream = getSampleStream()
        const hashList = hashList128KiB.slice()
        hashList[0] = ''
        const blockSize = 128 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', err => {
            expect(err).toBeInstanceOf(NotMatchedError)
            done()
          })
          .resume()
      })
    })

    describe('insufficient hash list', () => {
      it('fail', done => {
        const stream = getSampleStream()
        const hashList = hashList128KiB.slice(0, hashList128KiB.length - 1)
        const blockSize = 128 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', err => {
            expect(err).toBeInstanceOf(NotMatchedError)
            done()
          })
          .resume()
      })
    })

    describe('excessive hash list', () => {
      it('fail', done => {
        const stream = getSampleStream()
        const hashList = hashList128KiB.slice()
        hashList.push(hashList128KiB[0])
        const blockSize = 128 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
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

  // 6 same size parts, 1 smaller than others.
  describe('150KiB sample', () => {
    describe('correct hash list', () => {
      it('pass', done => {
        const stream = getSampleStream()
        const hashList = hashList150KiB
        const blockSize = 150 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', e => done(e))
          .on('end', () => done())
          .resume()
      })

      it('return same data', done => {
        go(async () => {
          const buffer = await getSampleBuffer()
          const stream = getSampleStream()
          const hashList = hashList150KiB
          const blockSize = 150 * KiB

          const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
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
    })

    describe('correct hash list', () => {
      it('pass', done => {
        const stream = getSampleStream()
        const hashList = hashList150KiB.slice()
        hashList[0] = ''
        const blockSize = 150 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', err => {
            expect(err).toBeInstanceOf(NotMatchedError)
            done()
          })
          .resume()
      })
    })

    describe('insufficient hash list', () => {
      it('fail', done => {
        const stream = getSampleStream()
        const hashList = hashList150KiB.slice(0, hashList150KiB.length - 1)
        const blockSize = 150 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
        stream
          .pipe(validator)
          .on('error', err => {
            expect(err).toBeInstanceOf(NotMatchedError)
            done()
          })
          .resume()
      })
    })

    describe('excessive hash list', () => {
      it('fail', done => {
        const stream = getSampleStream()
        const hashList = hashList150KiB.slice()
        hashList.push(hashList150KiB[0])
        const blockSize = 150 * KiB

        const validator = new SplitHashValidator(hashList, blockSize, createHexHash)
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
})
