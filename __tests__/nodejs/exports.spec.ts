import * as index from '@nodejs/index.js'

test('exports', () => {
  const expected = [
    'splitHash'
  , 'SplitHashValidator'

  , 'NotMatchedError'
  , 'StreamEncodingError'
  ].sort()

  const target = Object.keys(index).sort()

  expect(target).toStrictEqual(expected)
})
