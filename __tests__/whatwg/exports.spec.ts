import * as index from '@whatwg/index.js'

test('exports', () => {
  const expected = [
    'splitHash'
  ].sort()

  const target = Object.keys(index).sort()

  expect(target).toStrictEqual(expected)
})
