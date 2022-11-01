import * as index from '@whatwg'

test('exports', () => {
  const expected = [
    'splitHash'
  ].sort()

  const target = Object.keys(index).sort()

  expect(target).toStrictEqual(expected)
})
