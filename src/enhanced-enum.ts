type Value = number | string
type AnyObject = Record<string, unknown>
type NullAndObject = AnyObject | null

interface IDictOption<E extends NullAndObject> {
  value: Value
  label: string
  extra?: E
}

interface IMapper<T, E extends NullAndObject> {
  readonly key: keyof T
  readonly label: string
  readonly value: Value
  readonly extra?: E
}

type LabelString = string
type IEnumValue<E extends NullAndObject> = E extends null
  ? LabelString | [LabelString, Value]
  : [LabelString, E] | [LabelString, Value, E]

type GetKeyFn<T extends NullAndObject> = (obj: T) => (keyof T)[]
function getKeys<T extends NullAndObject>(obj: T) {
  return (Object.keys as GetKeyFn<T>)(obj)
}

interface IEnumResult<T, E extends NullAndObject, V> {
  /** VALUE Mapper By User Defined Key */
  VALUE: {
    [K in keyof T]: V
  }

  /** LABEL by value */
  LABEL: {
    [K in Value]: string
  }

  /** EXTRA by value */
  EXTRA: {
    [K in Value]: E | undefined
  }

  /** Mapper by value */
  MAPPER: {
    [K in Value]: IMapper<T, E>
  }
  /** Dict list */
  DICT: IDictOption<E>[]
}

function isPlainValue(value: Value | AnyObject): value is Value {
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

export function genMakeEnhancedEnum<E extends NullAndObject = null>() {
  function destructDefValue(defValue: IEnumValue<E>): IDictOption<E> {
    if (typeof defValue === 'string') {
      return { label: defValue, value: '' }
    }
    const [display, valueOrExtra, extra] = defValue
    return {
      label: display,
      value: isPlainValue(valueOrExtra) ? valueOrExtra : '',
      extra: getExtra(valueOrExtra, extra) as E, // Todo
    }
  }

  function makeEnhancedEnum<T extends Record<keyof T, IEnumValue<E>>>(
    input: T,
    offset = 0
  ): IEnumResult<T, E, Value> {
    const result = {
      DICT: [] as IDictOption<E>[],
      VALUE: {},
      EXTRA: {},
      LABEL: {},
      MAPPER: {},
    } as IEnumResult<T, E, Value>
    const keys = getKeys(input)
    keys.forEach((key, i) => {
      const rawDisplay = input[key] as IEnumValue<E>
      const defaultValue = i + offset
      const { label, value: cutsomValue, extra } = destructDefValue(rawDisplay)

      const value = cutsomValue || defaultValue

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
export const makeEnhancedEnum = genMakeEnhancedEnum<null>()
