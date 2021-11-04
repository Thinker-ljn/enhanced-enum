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

export interface IEnumResult<T, E extends NullAndObject> {
  /** VALUE Mapper By User Defined Key */
  VALUE: {
    [K in keyof T]: Value
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
  bindGetter(getter: () => Value | undefined): {
    in(...keys: (keyof T)[]): boolean
    not(...keys: (keyof T)[]): boolean
  }
  bind(v: Value): {
    in(...keys: (keyof T)[]): boolean
    not(...keys: (keyof T)[]): boolean
    value?: Value
    label?: string
    extra?: E
    mapper?: IMapper<T, E>
  }
}

function isPlainValue<V extends Value>(
  value: Value | AnyObject
): value is Value {
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
  autoIncrementAfterAlias?: boolean
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

function parserConfig(config: EnhancedEnumConfig | number) {
  if (typeof config === 'number') {
    return {
      offset: config,
    }
  }
  return config
}
function parserDefaultValue(
  config: EnhancedEnumConfig,
  key: string,
  index: number
) {
  if (config.useKeyAsValue) {
    return parserKey(key, config.useKeyAsValue)
  }

  if (config.offset) {
    return config.offset + index
  }

  return index
}

function parserNumberOffset(config: EnhancedEnumConfig | number): number {
  if (typeof config === 'number') {
    return config
  }

  if (!config.useKeyAsValue && typeof config.offset === 'number') {
    return config.offset
  }

  return 0
}

function wrapperAutoIncrement<T>(
  config: EnhancedEnumConfig,
  keys: (keyof T)[],
  callback: (key: keyof T, index: string | number) => string | number
) {
  const start = parserNumberOffset(config)
  const useIncrement = config.autoIncrementAfterAlias
  let prev: string | number = start
  let numberValue = start
  keys.forEach((key, index) => {
    let defaultValue
    if (useIncrement) {
      defaultValue = numberValue
    } else {
      defaultValue = parserDefaultValue(config, key as string, index)
    }

    prev = callback(key, defaultValue)
    if (typeof prev === 'number') {
      numberValue = prev + 1
    } else {
      numberValue++
    }
  })
}

export function genMakeEnhancedEnum<E extends NullAndObject = null>() {
  function destructDefValue(
    defValue: IEnumValue<E>,
    defaultValue: Value
  ): IDictOption<E> {
    if (typeof defValue === 'string') {
      return { label: defValue, value: defaultValue }
    }
    const [display, valueOrExtra, extra] = defValue
    return {
      label: display,
      value: isPlainValue(valueOrExtra)
        ? (valueOrExtra as Value)
        : defaultValue,
      extra: getExtra(valueOrExtra, extra) as E, // Todo
    }
  }

  function makeEnhancedEnum<T extends Record<keyof T, IEnumValue<E>>>(
    input: T,
    offset: EnhancedEnumConfig | number = 0
  ): IEnumResult<T, E> {
    const config = parserConfig(offset)
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
      DICT: [] as IDictOption<E>[],
      VALUE: {},
      EXTRA: {},
      LABEL: {},
      MAPPER: {},
    } as IEnumResult<T, E>
    const keys = getKeys(input)
    wrapperAutoIncrement(config, keys, (key, defaultValue) => {
      const rawDisplay = input[key] as IEnumValue<E>
      const {
        label,
        value: cutsomValue,
        extra,
      } = destructDefValue(rawDisplay, defaultValue as Value)

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

      return value
    })
    return result
  }

  return makeEnhancedEnum
}

export const makeEnhancedEnum = genMakeEnhancedEnum<null>()
