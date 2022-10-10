import { sum } from '../src/index'

describe('works', () => {
  it('returns expected value', () => {
    expect(sum(10, 10)).toBe(20)
  })
})
