# split-hash

Split the stream based on bytes and get digests from each part.

## Install

```sh
npm install --save split-hash
# or
yarn add split-hash
```

## Usage

```js
import { splitHash } from 'split-hash'
import * as crypto from 'crypto'

const KiB = 1024

const createHash = () => {
  const hash = crypto.createHash('sha256')
  return {
    update(buffer) {
      hash.update(buffer)
    }
  , digest() {
      return hash.digest('hex')
    }
  }
}

const stream = fs.createReadStream('filename.bin')
const result = splitHash(stream, 512 * KiB, createHash)

for await (const hash of result) {
  console.log(hash)
}
```

## API

### splitHash

```ts
function splitHash<T>(
  stream: NodeJS.ReadableStream
, blockSize: number
, createHash: ProgressiveHashFactory<T>
): AsyncIterable<T>

type ProgressiveHashFactory<T> = () => ProgressiveHash<T>

interface ProgressiveHash<T> {
  update(buffer: Buffer): void
  digest(): T
}
```

### StreamEncodingError

```ts
class StreamEncodingError extends Error
```
