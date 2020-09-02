import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

export const KiB = 1024

export function getSamplePath(): string {
  return path.join(__dirname, 'fixtures/sample.bin')
}

export async function getSampleBuffer(): Promise<Buffer> {
  return await fs.promises.readFile(getSamplePath())
}

export function getSampleStream(): NodeJS.ReadableStream {
  return fs.createReadStream(getSamplePath())
}

export function createHexHash() {
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
