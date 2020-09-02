import { isAsyncIterable } from '@blackglory/types'

/* eslint-disable */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAsyncIterable(): R
    }
  }
}
/* eslint-enable */

expect.extend({
  toBeAsyncIterable(received: unknown) {
    if (isAsyncIterable(received)) {
      return {
        message: () => `expected ${received} not to be a AsyncIterable`
      , pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a AsyncIterable`
      , pass: false
      }
    }
  }
})
