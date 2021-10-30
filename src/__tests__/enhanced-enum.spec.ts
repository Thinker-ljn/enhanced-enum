import { genMakeEnhancedEnum, makeEnhancedEnum } from '@/enhanced-enum'

describe('base enum', () => {
  it('start with default 0', () => {
    const STATUS = makeEnhancedEnum({
      /** 第一个 */
      A: '第一个',
      /** 第二个 */
      B: '第二个',
      /** 第三个 */
      C: '第三个',
    })
    expect(STATUS.DICT).toMatchObject([
      { value: 0, label: '第一个' },
      { value: 1, label: '第二个' },
      { value: 2, label: '第三个' },
    ])

    expect(STATUS.VALUE.A).toBe(0)
    expect(STATUS.VALUE.B).toBe(1)
    expect(STATUS.VALUE.C).toBe(2)

    expect(STATUS.LABEL).toMatchObject({
      0: '第一个',
      1: '第二个',
      2: '第三个',
    })

    expect(STATUS.EXTRA).toMatchObject({})

    expect(STATUS.MAPPER[0]).toMatchObject({
      key: 'A',
      label: '第一个',
      value: 0,
      extra: {},
    })
  })

  it('start with custom offset', () => {
    const STATUS = makeEnhancedEnum(
      {
        /** 第一个 */
        A: '第一个',
        /** 第二个 */
        B: '第二个',
        /** 第三个 */
        C: '第三个',
      },
      2
    )
    expect(STATUS.DICT).toMatchObject([
      { value: 2, label: '第一个' },
      { value: 3, label: '第二个' },
      { value: 4, label: '第三个' },
    ])

    expect(STATUS.VALUE.A).toBe(2)
    expect(STATUS.VALUE.B).toBe(3)
    expect(STATUS.VALUE.C).toBe(4)

    expect(STATUS.LABEL).toMatchObject({
      2: '第一个',
      3: '第二个',
      4: '第三个',
    })

    expect(STATUS.EXTRA).toMatchObject({})

    expect(STATUS.MAPPER[2]).toMatchObject({
      key: 'A',
      label: '第一个',
      value: 2,
      extra: {},
    })
  })

  it('use custom value', () => {
    const STATUS = makeEnhancedEnum(
      {
        /** 第一个 */
        A: '第一个',
        /** 第N个 */
        B: ['第N个', 1000],
        /** 第三个 */
        C: '第三个',
      },
      2
    )

    expect(STATUS.VALUE.A).toBe(2)
    expect(STATUS.VALUE.B).toBe(1000)
    expect(STATUS.VALUE.C).toBe(4)
  })
})

describe('with extra props', () => {
  const t = genMakeEnhancedEnum<{ color?: string }>()

  it('normal with extra props', () => {
    const STATUS = t({
      /** 第一个 */
      A: ['第一个', { color: 'red' }],
      /** 第二个 */
      B: ['第二个', {}],
    })
    expect(STATUS.EXTRA[0]).toMatchObject({ color: 'red' })
    expect(STATUS.EXTRA[1]).toMatchObject({})

    expect(STATUS.MAPPER[0]).toMatchObject({
      key: 'A',
      label: '第一个',
      value: 0,
      extra: { color: 'red' },
    })
  })

  it('custom value with extra props', () => {
    const STATUS = t({
      /** 第一个 */
      A: ['第一个', { color: 'red' }],
      /** 第N个 */
      B: ['第N个', 4000, {}],
      /** 第四个 */
      C: ['第四个', {}],
    })

    expect(STATUS.VALUE.A).toBe(0)
    expect(STATUS.VALUE.B).toBe(4000)
    expect(STATUS.VALUE.C).toBe(2)
    expect(STATUS.EXTRA[STATUS.VALUE.C]).toMatchObject({})
  })
})

describe('bind value', () => {
  it('bind primitive value', () => {
    const STATUS = makeEnhancedEnum({
      /** 第一个 */
      A: '第一个',
      /** 第二个 */
      B: '第二个',
      /** 第三个 */
      C: '第三个',
    })

    const eA = STATUS.bind(0)

    expect(eA.in('A')).toBe(true)
    expect(eA.in('A', 'B')).toBe(true)
    expect(eA.in('C', 'B')).toBe(false)
    expect(eA.not('C', 'B')).toBe(true)

    expect(eA.value).toBe(0)
    expect(eA.label).toBe('第一个')
  })

  it('bind getter value', () => {
    const STATUS = makeEnhancedEnum({
      /** 第一个 */
      A: '第一个',
      /** 第二个 */
      B: '第二个',
      /** 第三个 */
      C: '第三个',
    })

    const eB = STATUS.bindGetter(() => 1)

    expect(eB.in('B')).toBe(true)
    expect(eB.in('A', 'B')).toBe(true)
    expect(eB.in('C', 'A')).toBe(false)
    expect(eB.not('C', 'A')).toBe(true)
  })
})
