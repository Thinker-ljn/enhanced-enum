type Value = number | string
type AnyObject = Record<string, unknown>
type NullAndObject = AnyObject | null

interface IDictOption<E extends NullAndObject, V extends Value> {
  value: V
  label: string
  extra?: E
}

interface IMapper<T, E extends NullAndObject, V extends Value> {
  readonly key: keyof T
  readonly label: string
  readonly value: V
  readonly extra?: E
}

type LabelString = string
type IEnumValue<E extends NullAndObject, V extends Value> = E extends null
  ? LabelString | [LabelString, V]
  : [LabelString, E] | [LabelString, V, E]

type GetKeyFn<T extends NullAndObject> = (obj: T) => (keyof T)[]
function getKeys<T extends NullAndObject>(obj: T) {
  return (Object.keys as GetKeyFn<T>)(obj)
}

interface IEnumResult<T, E extends NullAndObject, V extends Value> {
  /** VALUE Mapper By User Defined Key */
  VALUE: {
    [K in keyof T]: V
  }

  /** LABEL by value */
  LABEL: {
    [K in V]: string
  }

  /** EXTRA by value */
  EXTRA: {
    [K in V]: E | undefined
  }

  /** Mapper by value */
  MAPPER: {
    [K in V]: IMapper<T, E, V>
  }
  /** Dict list */
  DICT: IDictOption<E, V>[]
}

function isPlainValue<V extends Value>(value: V | AnyObject): value is V {
  const valueType = typeof value
  return valueType === 'string' || valueType === 'number'
}

function getExtra(valueOrExtra: AnyObject | Value, extra: AnyObject | Value) {
  if (typeof extra === 'object') {
    return extra
  }
  if (typeof valueOrExtra === 'object') {
    return valueOrExtra
  }

  return undefined
}

export function genMakeEnhancedEnum<
  E extends NullAndObject = null,
  V extends Value = number
>() {
  function destructDefValue(
    defValue: IEnumValue<E, V>,
    defaultValue: V
  ): IDictOption<E, V> {
    if (typeof defValue === 'string') {
      return { label: defValue, value: defaultValue }
    }
    const [display, valueOrExtra, extra] = defValue
    return {
      label: display,
      value: isPlainValue(valueOrExtra) ? (valueOrExtra as V) : defaultValue,
      extra: getExtra(valueOrExtra, extra) as E, // Todo
    }
  }

  function makeEnhancedEnum<T extends Record<keyof T, IEnumValue<E, V>>>(
    input: T,
    offset = 0
  ): IEnumResult<T, E, V> {
    const result = {
      DICT: [] as IDictOption<E, V>[],
      VALUE: {},
      EXTRA: {},
      LABEL: {},
      MAPPER: {},
    } as IEnumResult<T, E, V>
    const keys = getKeys(input)
    keys.forEach((key, i) => {
      const rawDisplay = input[key] as IEnumValue<E, V>
      const defaultValue = i + offset
      const {
        label,
        value: cutsomValue,
        extra,
      } = destructDefValue(rawDisplay, defaultValue as V)

      const value = cutsomValue

      result.VALUE[key] = value
      result.LABEL[value] = label
      result.EXTRA[value] = extra
      result.MAPPER[value] = {
        key,
        label,
        value,
        extra,
      }
      result.DICT.push({
        label,
        value,
        extra,
      })
    })
    return result
  }

  return makeEnhancedEnum
}

export const makeEnhancedEnum = genMakeEnhancedEnum<null, number>()
