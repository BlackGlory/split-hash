import * as crypto from 'crypto'
import { getErrorAsyncIterable } from 'return-style'
import { splitHash, ProgressiveHashFactory, StreamEncodingError } from '@src/split-hash'
import * as fs from 'fs'
import * as path from 'path'
import { toArrayAsync } from 'iterable-operator'
import '@test/matchers'

/*
  # create fixtures
  dd if=/dev/urandom of=sample.bin bs=1M count=1 iflag=fullblock
*/

const KiB = 1024

describe('splitHash', () => {
  describe('encoding stream', () => {
    it('throw StreamEncodingError', async () => {
      const createHash: ProgressiveHashFactory<string> = () => {
        const hash = crypto.createHash('sha256')
        return {
          update(buffer: Buffer) {
            hash.update(buffer)
          }
        , digest() {
            return hash.digest('hex')
          }
        }
      }

      const stream = getSampleStream()
      stream.setEncoding('hex')
      const result = splitHash(stream, 128 * KiB, createHash)
      const error = await getErrorAsyncIterable(result)

      expect(result).toBeAsyncIterable()
      expect(error).toBeInstanceOf(StreamEncodingError)
    })
  })

  describe('128KiB sample', () => {
    /*
      # split
      split -b 128k sample.bin -d -a 2 split_sample
      # hash
      sha256sum split_sample*
      # clean
      rm split_sample*
    */
    const hashList = [
      '3dcf9dd1c41cd30c369c39d3797e3569121a76f3b1edc2b50960697a11791f43'
    , '3932092d162e24a9e6921e2e50182b03b4160f64855a12aa5f87771351325bb0'
    , '77c2d4ad857d8711ad597e62c775f4b3a638c8d770bbc70ffa60f42cf62acc0f'
    , '969132cd70b326aefea39928aaca1af5ecc84f19ed92f7674713cca07afc022f'
    , '0a6b7fa3a5c78828c6a16fa926fa3182f9d0a9cfca1f061dba0bd22a1792e657'
    , 'c882d31c32ed3aa47efc2e9873e27016640c261a0f394fca1783ed69d4d8d387'
    , '7b4302ffe1b36759085abffede89a54982913c681c71be7c8b324add37b5b448'
    , '5d23703cc48ee5f997a5a3068dad9e93fa32a8e037e482380208f4c92e20014c'
    ]

    it('split and hash sample', async () => {
      const createHash: ProgressiveHashFactory<string> = () => {
        const hash = crypto.createHash('sha256')
        return {
          update(buffer: Buffer) {
            hash.update(buffer)
          }
        , digest() {
            return hash.digest('hex')
          }
        }
      }

      const result = splitHash(getSampleStream(), 128 * KiB, createHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList)
    })
  })

  describe('150KiB sample', () => {
    /*
      # split
      split -b 150k sample.bin -d -a 2 split_sample
      # hash
      sha256sum split_sample*
      # clean
      rm split_sample*
    */
    const hashList = [
      '9badc27fe1f6963366c35587effb8b6088e50880b14e28d7674bbdea6643abcd'
    , 'd0fd7b82742ad0a77d67de794da8a35d7d05c078e8d0384d2415406692142027'
    , '42638f355bc4f3d20d28819bb49574b16279bcb22e21064ea0fd1e841566a1f7'
    , '7d19453c2cf0ea1accf8671ebaa80af34abc409798509521e09202a35e744127'
    , '22b96ee246123bc8bcdca065e1827e05db620cb596e25deed9694369c272721d'
    , '3d7da106c3e106f9cd65df4b09175966eb7650d9655544738eee1037aab34595'
    , '34ec05b0cdae8ed0c7f291dbee148e38c9b0b85464ae9c9d663e43a5907c5ece' // smaller than others
    ]

    it('split and hash', async () => {
      const createHash: ProgressiveHashFactory<string> = () => {
        const hash = crypto.createHash('sha256')
        return {
          update(buffer: Buffer) {
            hash.update(buffer)
          }
        , digest() {
            return hash.digest('hex')
          }
        }
      }

      const result = splitHash(getSampleStream(), 150 * KiB, createHash)
      const arrResult = await toArrayAsync(result)

      expect(result).toBeAsyncIterable()
      expect(arrResult).toStrictEqual(hashList)
    })
  })
})

function getSamplePath(): string {
  return path.join(__dirname, 'fixtures/sample.bin')
}

function getSampleStream(): NodeJS.ReadableStream {
  return fs.createReadStream(getSamplePath())
}
