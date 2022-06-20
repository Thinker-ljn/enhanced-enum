type EEValue = number | string
type AnyObject = Record<string, unknown>
type NullAndObject = AnyObject | null

interface EEDictOption<E extends NullAndObject, V extends EEValue = EEValue> {
  value: V
  label: string
  extra?: E
}

interface EEMapper<T, E extends NullAndObject, V extends EEValue = EEValue> {
  readonly key: keyof T
  readonly label: string
  readonly value: V
  readonly extra?: E
}

type LabelString = string
type EEValueConfig<
  E extends NullAndObject,
  V extends EEValue = EEValue
> = E extends null
  ? LabelString | [LabelString, V]
  : [LabelString, E] | [LabelString, V, E]

type GetKeyFn<T extends NullAndObject> = (obj: T) => (keyof T)[]
function getKeys<T extends NullAndObject>(obj: T) {
  return (Object.keys as GetKeyFn<T>)(obj)
}

export interface EEResult<
  T,
  E extends NullAndObject,
  V extends EEValue = EEValue
> {
  /** VALUE Mapper By User Defined Key */
  VALUE: Record<keyof T, V>

  /** LABEL by value */
  LABEL: Record<V, string>

  /** EXTRA by value */
  EXTRA: Record<V, E | undefined>

  /** Mapper by value */
  MAPPER: Record<V, EEMapper<T, E, V>>
  /** Dict list */
  DICT: EEDictOption<E, V>[]
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
    mapper?: EEMapper<T, E>
  }
}

function isPlainValue<V extends EEValue = EEValue>(
  value: V | AnyObject
): value is V {
  const valueType = typeof value
  return valueType === 'string' || valueType === 'number'
}

function getExtra<V extends EEValue = EEValue>(
  valueOrExtra: AnyObject | V,
  extra?: AnyObject | V
) {
  if (typeof extra === 'object') {
    return extra
  }
  if (typeof valueOrExtra === 'object') {
    return valueOrExtra
  }

  return undefined
}

/**@deprecated use EEKeyValueType */
export enum KeyValueType {
  UPPER_CAMEL_CASE = 'UPPER_CAMEL_CASE', // UpperCamelCase
  LOWER_CAMEL_CASE = 'LOWER_CAMEL_CASE', // lowerCamelCase
  SNAKE_CASE = 'SNAKE_CASE', // snake_case
  KEBAB_CASE = 'KEBAB_CASE', // kebab-case
}

export enum EEKeyValueType {
  UPPER_CAMEL_CASE = 'UPPER_CAMEL_CASE', // UpperCamelCase
  LOWER_CAMEL_CASE = 'LOWER_CAMEL_CASE', // lowerCamelCase
  SNAKE_CASE = 'SNAKE_CASE', // snake_case
  KEBAB_CASE = 'KEBAB_CASE', // kebab-case
}

/**@deprecated use EEConfig */
export interface EnhancedEnumConfig {
  useStringNumberValue?: boolean
  useKeyAsValue?: boolean | EEKeyValueType | KeyValueType
  offset?: number
  autoIncrementAfterAlias?: boolean
}

export type EEConfig = EnhancedEnumConfig

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

function parserKey(
  key: string,
  type?: EEKeyValueType | KeyValueType | boolean
): string {
  checkKey(key)
  switch (type) {
    case EEKeyValueType.UPPER_CAMEL_CASE:
      return key
        .toLowerCase()
        .replace(/(?:^|_)(\w)/g, (_, m1) => m1.toUpperCase())
    case EEKeyValueType.LOWER_CAMEL_CASE:
      return key.toLowerCase().replace(/_(\w)/g, (_, m1) => m1.toUpperCase())
    case EEKeyValueType.SNAKE_CASE:
      return key.toLowerCase()
    case EEKeyValueType.KEBAB_CASE:
      return key.toLowerCase().replace('_', '-')
    default:
      return key
  }
}

function parserConfig(config: EEConfig | number) {
  if (typeof config === 'number') {
    return {
      offset: config,
    }
  }
  return config
}
function parserDefaultValue(config: EEConfig, key: string, index: number) {
  if (config.useKeyAsValue) {
    return parserKey(key, config.useKeyAsValue)
  }

  if (config.offset) {
    return config.offset + index
  }

  return index
}

function parserNumberOffset(config: EEConfig | number): number {
  if (typeof config === 'number') {
    return config
  }

  if (!config.useKeyAsValue && typeof config.offset === 'number') {
    return config.offset
  }

  return 0
}

function wrapperAutoIncrement<T>(
  config: EEConfig,
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

export function genMakeEnhancedEnum<
  E extends NullAndObject = null,
  V extends EEValue = EEValue
>() {
  function destructDefValue(
    defValue: EEValueConfig<E, V>,
    defaultValue: V
  ): EEDictOption<E, V> {
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

  function makeEnhancedEnum<T extends Record<keyof T, EEValueConfig<E, V>>>(
    input: T,
    offset: EEConfig | number = 0
  ): EEResult<T, E, V> {
    const config = parserConfig(offset)
    const result: EEResult<T, E, V> = {
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
      DICT: [],
      VALUE: {} as Record<keyof T, V>,
      EXTRA: {} as Record<V, E | undefined>,
      LABEL: {} as Record<V, string>,
      MAPPER: {} as Record<V, EEMapper<T, E, V>>,
    }
    const keys = getKeys(input)
    wrapperAutoIncrement(config, keys, (key, defaultValue) => {
      const rawDisplay = input[key] as EEValueConfig<E, V>
      const {
        label,
        value: cutsomValue,
        extra,
      } = destructDefValue(rawDisplay, defaultValue as V)

      const value = config.useStringNumberValue
        ? (String(cutsomValue) as V)
        : cutsomValue

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

      return cutsomValue
    })
    return result
  }

  return makeEnhancedEnum
}

export const makeEnhancedEnum = genMakeEnhancedEnum<null>()
export const makeEnhancedStringEnum = genMakeEnhancedEnum<null, string>()
export const makeEnhancedNumberEnum = genMakeEnhancedEnum<null, number>()
