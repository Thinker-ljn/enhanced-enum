import {
  buildIllegalMsg,
  checkKey,
  EEConfig,
  genMakeEnhancedEnum,
  EEKeyValueType,
  makeEnhancedEnum,
} from '@/enhanced-enum'

function genDefault(offset: EEConfig | number = 0) {
  return makeEnhancedEnum(
    {
      /** 第一个 */
      A: '第一个',
      /** 第二个 */
      B: '第二个',
      /** 第三个 */
      C: '第三个',
    },
    offset
  )
}

describe('base enum', () => {
  it('start with default 0', () => {
    const STATUS = genDefault()
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
    const STATUS = genDefault(2)
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
    const STATUS = genDefault()

    const eA = STATUS.bind(0)

    expect(eA.in('A')).toBe(true)
    expect(eA.in('A', 'B')).toBe(true)
    expect(eA.in('C', 'B')).toBe(false)
    expect(eA.not('C', 'B')).toBe(true)

    expect(eA.value).toBe(0)
    expect(eA.label).toBe('第一个')
  })

  it('bind getter value', () => {
    const STATUS = genDefault()

    const eB = STATUS.bindGetter(() => 1)

    expect(eB.in('B')).toBe(true)
    expect(eB.in('A', 'B')).toBe(true)
    expect(eB.in('C', 'A')).toBe(false)
    expect(eB.not('C', 'A')).toBe(true)
  })
})

function genDefault2(offset: EEConfig | number = 0) {
  return makeEnhancedEnum(
    {
      /** 第一个 */
      AZ_AZ: '第一个',
      /** 第二个 */
      BZ_BZ: '第二个',
      /** 第三个 */
      CZ_CZ: '第三个',
    },
    offset
  )
}

describe('use key as value', () => {
  const STATUS = genDefault2({ useKeyAsValue: true })
  expect(STATUS.VALUE.AZ_AZ).toBe('AZ_AZ')
  expect(STATUS.VALUE.BZ_BZ).toBe('BZ_BZ')

  const STATUS2 = genDefault2({
    useKeyAsValue: EEKeyValueType.UPPER_CAMEL_CASE,
  })
  expect(STATUS2.VALUE.AZ_AZ).toBe('AzAz')
  expect(STATUS2.VALUE.BZ_BZ).toBe('BzBz')

  const STATUS3 = genDefault2({
    useKeyAsValue: EEKeyValueType.LOWER_CAMEL_CASE,
  })
  expect(STATUS3.VALUE.AZ_AZ).toBe('azAz')
  expect(STATUS3.VALUE.BZ_BZ).toBe('bzBz')

  const STATUS4 = genDefault2({ useKeyAsValue: EEKeyValueType.SNAKE_CASE })
  expect(STATUS4.VALUE.AZ_AZ).toBe('az_az')
  expect(STATUS4.VALUE.BZ_BZ).toBe('bz_bz')

  const STATUS5 = genDefault2({ useKeyAsValue: EEKeyValueType.KEBAB_CASE })
  expect(STATUS5.VALUE.AZ_AZ).toBe('az-az')
  expect(STATUS5.VALUE.BZ_BZ).toBe('bz-bz')
})

describe('check key', () => {
  it('legal key', () => {
    expect(checkKey('AA_BB_CC')).toBe(true)
    expect(checkKey('AA_BB_CC213')).toBe(true)
    expect(checkKey('A')).toBe(true)
  })
  it('illegal key', () => {
    ;['A_', '_AA_BC', 'a1', 'a1_b', 'aa_bb_cc'].forEach((k) => {
      expect(() => checkKey(k)).toThrowError(buildIllegalMsg(k))
    })
  })
})

const genDefault3 = (config: EEConfig) => {
  return makeEnhancedEnum(
    {
      /** 第二 */
      A: '第二',
      /** 第十一 */
      B: ['第十一', 11],
      /** 第十二 */
      C: '第十二',
      /** 第二十一 */
      D: ['第二十一', 21],
      /** 第二十二 */
      E: '第二十二',
      /** 第二十三 */
      F: ['第二十三', '第二十三'],
      /** 第二十四 */
      G: '第二十四',
    },
    config
  )
}

describe('autoIncrementAfterAlias', () => {
  const STATUS = genDefault3({
    offset: 2,
    autoIncrementAfterAlias: true,
  })
  it('should auto increment', () => {
    expect(STATUS.VALUE.A).toBe(2)
    expect(STATUS.VALUE.B).toBe(11)
    expect(STATUS.VALUE.C).toBe(12)
    expect(STATUS.VALUE.D).toBe(21)
    expect(STATUS.VALUE.E).toBe(22)
    expect(STATUS.VALUE.F).toBe('第二十三')
    expect(STATUS.VALUE.G).toBe(24)
  })
})

describe('useStringNumberValue', () => {
  it('should return string type', () => {
    const STATUS = genDefault({ useStringNumberValue: true })
    expect(STATUS.VALUE.A).toBe('0')
    expect(STATUS.VALUE.B).toBe('1')
    expect(STATUS.VALUE.C).toBe('2')
  })

  it('should return string type and auto increment', () => {
    const STATUS = genDefault3({
      offset: 2,
      autoIncrementAfterAlias: true,
      useStringNumberValue: true,
    })
    expect(STATUS.VALUE.A).toBe('2')
    expect(STATUS.VALUE.B).toBe('11')
    expect(STATUS.VALUE.C).toBe('12')
    expect(STATUS.VALUE.D).toBe('21')
    expect(STATUS.VALUE.E).toBe('22')
    expect(STATUS.VALUE.F).toBe('第二十三')
    expect(STATUS.VALUE.G).toBe('24')
  })
})
