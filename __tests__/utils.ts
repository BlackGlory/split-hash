import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { IProgressiveHash as INodeJSProgressiveHash } from '@nodejs/types'
import { IProgressiveHash as IWHATWGProgressiveHash } from '@whatwg/types'
import { DynamicTypedArray } from '@blackglory/structures'
import { map, toArray } from 'iterable-operator'
import { Readable } from 'stream'
import { ReadableStream } from 'stream/web'
import { isntNull } from '@blackglory/prelude'
import { AbortController } from 'extra-abort'
import { waitForEventEmitter } from '@blackglory/wait-for'

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
  return toWHATWGReadableStream(getSampleNodeJSStream())
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

// It is not a robust implementation.
// There is a `Readable.toWeb` method in the higher version of Node.js.
export function toWHATWGReadableStream(stream: Readable): ReadableStream {
  if (stream.destroyed) {
    const stream = new ReadableStream()
    stream.cancel()
    return stream
  }

  return new ReadableStream({
    async start(): Promise<void> {
      await waitForEventEmitter(stream, 'readable')
    }
  , async pull(controller): Promise<void> {
      const chunk = stream.read(controller.desiredSize ?? undefined)
      if (isntNull(chunk)) {
        controller.enqueue(chunk)
      } else {
        const abortController = new AbortController()
        await Promise.race([
          waitForEventEmitter(stream, 'end', abortController.signal)
        , waitForEventEmitter(stream, 'readable', abortController.signal)
        ])
        abortController.abort()
        if (stream.readableEnded) {
          controller.close()
        }
      }
    }
  , cancel(): void {
      stream.destroy()
    }
  })
}
