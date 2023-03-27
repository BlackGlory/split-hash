import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { IProgressiveHash as INodeJSProgressiveHash } from '@nodejs/types.js'
import { IProgressiveHash as IWHATWGProgressiveHash } from '@whatwg/types.js'
import { DynamicTypedArray } from '@blackglory/structures'
import { map, toArray } from 'iterable-operator'
import { Readable } from 'stream'
import { ReadableStream } from 'stream/web'
import { toReadableStream } from 'extra-stream'

export const KiB = 1024

export function getSamplePath(): string {
  return path.join(__dirname, 'fixtures/sample.bin')
}

export async function getSampleBuffer(): Promise<Buffer> {
  return await fs.promises.readFile(getSamplePath())
}

export function getSampleNodeJSStream(): Readable {
  return fs.createReadStream(getSamplePath())
}

export function getSampleWHATWGStream(): ReadableStream {
  return toReadableStream(getSampleNodeJSStream()) as ReadableStream
}

export function createNodeJSHexHash(): INodeJSProgressiveHash<string> {
  const hash = crypto.createHash('sha256')

  return {
    update(buffer: Buffer): void {
      hash.update(buffer)
    }
  , digest(): string {
      return hash.digest('hex')
    }
  }
}

export function createWHATWGHextHash(): IWHATWGProgressiveHash<string> {
  const data = new DynamicTypedArray(Uint8Array)
  let pos = 0

  return {
    update(buffer: Uint8Array): void {
      buffer.forEach((x, i) => data.set(pos + i, x))
      pos += buffer.length
    }
  , async digest(): Promise<string> {
      const hashBuffer = await globalThis.crypto.subtle.digest(
        'SHA-256'
      , data.internalTypedArray.slice(0, pos)
      )
      return bufferToHex(hashBuffer)
    }
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return toArray(map(bytes, byte => byte.toString(16).padStart(2, '0'))).join('')
}

export function bufferToBytes(buffer: ArrayBufferLike): number[] {
  return toArray(new Uint8Array(buffer))
}
