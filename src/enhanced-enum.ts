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

export interface IEnumResult<T, E extends NullAndObject, V extends Value> {
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
  bindGetter(getter: () => V | undefined): {
    in(...keys: (keyof T)[]): boolean
    not(...keys: (keyof T)[]): boolean
  }
  bind(v: V): {
    in(...keys: (keyof T)[]): boolean
    not(...keys: (keyof T)[]): boolean
    value?: V
    label?: string
    extra?: E
    mapper?: IMapper<T, E, V>
  }
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

export enum KeyValueType {
  UPPER_CAMEL_CASE = 'UPPER_CAMEL_CASE', // UpperCamelCase
  LOWER_CAMEL_CASE = 'LOWER_CAMEL_CASE', // lowerCamelCase
  SNAKE_CASE = 'SNAKE_CASE', // snake_case
  KEBAB_CASE = 'KEBAB_CASE', // kebab-case
}
export interface EnhancedEnumConfig {
  useKeyAsValue?: boolean | KeyValueType
  offset?: number
}

export function buildIllegalMsg(key: string) {
  return `Illegal key: ${key}, key must match \`/^([A-Z][A-Z_]+)?([A-Z]([0-9]*))$/\``
}
export function checkKey(key: string) {
  if (!/^([A-Z][A-Z_]+)?([A-Z]([0-9]*))$/.test(key)) {
    throw new Error(buildIllegalMsg(key))
  } else {
    return true
  }
}

function parserKey(key: string, type?: KeyValueType | boolean): string {
  checkKey(key)
  switch (type) {
    case KeyValueType.UPPER_CAMEL_CASE:
      return key
        .toLowerCase()
        .replace(/(?:^|_)(\w)/g, (_, m1) => m1.toUpperCase())
    case KeyValueType.LOWER_CAMEL_CASE:
      return key.toLowerCase().replace(/_(\w)/g, (_, m1) => m1.toUpperCase())
    case KeyValueType.SNAKE_CASE:
      return key.toLowerCase()
    case KeyValueType.KEBAB_CASE:
      return key.toLowerCase().replace('_', '-')
    default:
      return key
  }
}

function parserDefaultValue(
  config: EnhancedEnumConfig | number,
  key: string,
  index: number
) {
  if (typeof config === 'number') {
    // offset
    return config + index
  }

  if (config.useKeyAsValue) {
    return parserKey(key, config.useKeyAsValue)
  }

  if (config.offset) {
    return config.offset + index
  }

  return index
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
    offset: EnhancedEnumConfig | number = 0
  ): IEnumResult<T, E, V> {
    const result = {
      bind(value) {
        return {
          in(...keys) {
            return keys.some((k) => result.VALUE[k] === value)
          },
          not(...keys) {
            return keys.every((k) => result.VALUE[k] !== value)
          },
          value,
          label: result.LABEL[value],
          extra: result.EXTRA[value],
          mapper: result.MAPPER[value],
        }
      },
      bindGetter(getter) {
        return {
          in(...keys) {
            const value = getter()
            return keys.some((k) => result.VALUE[k] === value)
          },
          not(...keys) {
            const value = getter()
            return keys.every((k) => result.VALUE[k] !== value)
          },
        }
      },
      DICT: [] as IDictOption<E, V>[],
      VALUE: {},
      EXTRA: {},
      LABEL: {},
      MAPPER: {},
    } as IEnumResult<T, E, V>
    const keys = getKeys(input)
    keys.forEach((key, i) => {
      const rawDisplay = input[key] as IEnumValue<E, V>
      const defaultValue = parserDefaultValue(offset, key as string, i)
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
