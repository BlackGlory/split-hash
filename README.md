# split-hash

Split the stream based on bytes and get digests from each part.

## Install

```sh
npm install --save split-hash
# or
yarn add split-hash
```

## Usage

### Hash

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
const iter = splitHash(stream, 512 * KiB, createHash)

for await (const hash of iter) {
  console.log(hash)
}
```

### Validate

```js
import { SplitHashValidator } from 'split-hash'
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

const hashList = [/* ... */]
const validator = new SplitHashValidator(hashList, 512 * KiB, createHash)

const stream = fs.createReadStream('filename.bin')
stream
  .pipe(validator)
  .on('data', /* same as stream */)
  .on('error', err => console.error('not matched'))
```

## Interface

```ts
type ProgressiveHashFactory<T> = () => ProgressiveHash<T>

interface ProgressiveHash<T> {
  update(buffer: Buffer): void
  digest(): T
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
```

It throws `StreamEncodingError` when the `stream` encoding is set.

### SplitHashValidator

```ts
class SplitHashValidator<T> extends Stream.Transform {
  constructor(
    digests: T[]
  , blockSize: number
  , createHash: ProgressiveHashFactory<T>
  , equals: (a: T, b: T) => boolean = Object.is
  )
}
```

It throws `NotMatchedError` when the `stream` does not match digests.

### StreamEncodingError

```ts
class StreamEncodingError extends Error
```

### NotMatchedError

```ts
class NotMatchedError extends Error
```
