type EEValue = number | string
type AnyObject = Record<string, unknown>
type NullAndObject = AnyObject | null

/** A modern enum entry with an explicit value, display label, and optional metadata. */
export type EnumDefinitionEntry<V extends EEValue = EEValue> = Readonly<{
  value: V
  label: string
}>

export type EnumDefinition = Readonly<Record<string, EnumDefinitionEntry>>
type EnumKey<T extends EnumDefinition> = Extract<keyof T, string>
type EnumItem<T extends EnumDefinition> = {
  [K in EnumKey<T>]: Readonly<T[K] & { key: K }>
}[EnumKey<T>]
export type KeyEnumDefinitionEntry = Readonly<{
  label: string
  value?: never
}>
export type KeyEnumDefinition = Readonly<
  Record<string, KeyEnumDefinitionEntry>
>
export type KeyEnumFormat =
  | 'preserve'
  | 'upperCamelCase'
  | 'lowerCamelCase'
  | 'snake_case'
  | 'kebab-case'
export interface DefineKeyEnumOptions<
  F extends KeyEnumFormat = KeyEnumFormat
> {
  format?: F
}
type UpperCamelKey<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Capitalize<Lowercase<Head>>}${UpperCamelKey<Tail>}`
  : Capitalize<Lowercase<S>>
type LowerCamelKey<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}${UpperCamelKey<Tail>}`
  : Lowercase<S>
type KebabKey<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}-${KebabKey<Tail>}`
  : Lowercase<S>
type KeyEnumValue<K extends string, F extends KeyEnumFormat> = F extends 'preserve'
  ? K
  : F extends 'upperCamelCase'
    ? UpperCamelKey<K>
    : F extends 'lowerCamelCase'
      ? LowerCamelKey<K>
      : F extends 'snake_case'
        ? Lowercase<K>
        : KebabKey<K>
type KeyEnumKey<T extends KeyEnumDefinition> = Extract<keyof T, string>
type KeyEnumItem<T extends KeyEnumDefinition, F extends KeyEnumFormat> = {
  [K in KeyEnumKey<T>]: Readonly<
    Omit<T[K], 'value'> & { key: K; value: KeyEnumValue<K, F> }
  >
}[KeyEnumKey<T>]
export type NumberEnumDefinitionEntry = Readonly<{
  label: string
  value?: number
}>
export type NumberEnumDefinition = Readonly<
  Record<string, NumberEnumDefinitionEntry>
>
export type NumberEnumOutput = 'number' | 'string'
export interface DefineNumberEnumOptions<
  O extends NumberEnumOutput = NumberEnumOutput
> {
  start?: number
  continueAfterExplicit?: boolean
  output?: O
}
type NumberEnumKey<T extends NumberEnumDefinition> = Extract<keyof T, string>
type NumberEnumValue<
  T extends NumberEnumDefinitionEntry,
  O extends NumberEnumOutput
> = O extends 'string'
  ? T extends { readonly value: infer V extends number }
    ? `${V}`
    : string
  : T extends { readonly value: infer V extends number }
    ? V
    : number
type NumberEnumItem<
  T extends NumberEnumDefinition,
  O extends NumberEnumOutput
> = {
  [K in NumberEnumKey<T>]: Readonly<
    Omit<T[K], 'value'> & {
      key: K
      value: NumberEnumValue<T[K], O>
    }
  >
}[NumberEnumKey<T>]
export type EnumEntry<V extends EEValue = EEValue> = Readonly<{
  key: string
  value: V
  label: string
}>
type EntryKey<T extends EnumEntry> = T['key']
type EntryValue<T extends EnumEntry> = T['value']
type EntryByKey<T extends EnumEntry, K extends EntryKey<T>> = Extract<
  T,
  { readonly key: K }
>
type EntryByValue<T extends EnumEntry, V extends EntryValue<T>> = Extract<
  T,
  { readonly value: V }
>
type EnumValues<T extends EnumEntry> = {
  readonly [K in EntryKey<T>]: EntryByKey<T, K>['value']
}
type EnumByValue<T extends EnumEntry> = {
  readonly [V in EntryValue<T>]: EntryByValue<T, V>
}
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

/**
 * The shared result of modern enum definitions.
 *
 * Lowercase members are the recommended API. Uppercase members are compatibility
 * aliases which point to the same readonly data.
 */
export interface EnumResult<T extends EnumEntry> {
  readonly values: EnumValues<T>
  readonly byValue: EnumByValue<T>
  readonly options: readonly T[]
  readonly VALUE: EnumValues<T>
  readonly MAPPER: EnumByValue<T>
  readonly DICT: readonly T[]
  isKey(key: unknown): key is EntryKey<T>
  isValue(value: unknown): value is EntryValue<T>
  matches(value: unknown, ...keys: EntryKey<T>[]): boolean
  get<V extends EntryValue<T>>(value: V): EntryByValue<T, V> | undefined
  get(value: unknown): T | undefined
  fromKey<K extends EntryKey<T>>(key: K): EntryByKey<T, K> | undefined
  fromKey(key: unknown): T | undefined
}

function matchesEnumValue<K extends PropertyKey, V>(
  values: Readonly<Record<K, V>>,
  value: unknown,
  keys: readonly K[]
): boolean {
  return keys.some((key) => values[key] === value)
}

export type DefinedEnum<T extends EnumDefinition> = EnumResult<EnumItem<T>>
export type DefinedKeyEnum<
  T extends KeyEnumDefinition,
  F extends KeyEnumFormat
> = EnumResult<KeyEnumItem<T, F>>
export type DefinedNumberEnum<
  T extends NumberEnumDefinition,
  O extends NumberEnumOutput
> = EnumResult<NumberEnumItem<T, O>>

function createEnumResult<T extends EnumEntry>(
  items: readonly T[]
): EnumResult<T> {
  const values = Object.create(null) as Mutable<EnumValues<T>>
  const byValue = Object.create(null) as Mutable<EnumByValue<T>>
  const valueSet = new Set<EEValue>()

  items.forEach((item) => {
    if (valueSet.has(item.value)) {
      throw new Error(`Duplicate enum value: ${String(item.value)}`)
    }

    valueSet.add(item.value)
    values[item.key as EntryKey<T>] = item.value as EnumValues<T>[EntryKey<T>]
    byValue[item.value as EntryValue<T>] = item as EnumByValue<T>[EntryValue<T>]
  })

  const readonlyValues = Object.freeze(values)
  const readonlyByValue = Object.freeze(byValue)
  const readonlyOptions = Object.freeze([...items]) as readonly T[]

  return Object.freeze({
    values: readonlyValues,
    byValue: readonlyByValue,
    options: readonlyOptions,
    VALUE: readonlyValues,
    MAPPER: readonlyByValue,
    DICT: readonlyOptions,
    isKey(key: unknown): key is EntryKey<T> {
      return (
        typeof key === 'string' &&
        Object.prototype.hasOwnProperty.call(readonlyValues, key)
      )
    },
    isValue(value: unknown): value is EntryValue<T> {
      return (
        (typeof value === 'string' || typeof value === 'number') &&
        valueSet.has(value)
      )
    },
    matches(value: unknown, ...keys: EntryKey<T>[]): boolean {
      return matchesEnumValue(readonlyValues, value, keys)
    },
    get(value: unknown) {
      return (
        (typeof value === 'string' || typeof value === 'number') &&
        valueSet.has(value)
      )
        ? readonlyByValue[value as EntryValue<T>]
        : undefined
    },
    fromKey(key: unknown) {
      return typeof key === 'string' && Object.prototype.hasOwnProperty.call(readonlyValues, key)
        ? readonlyByValue[readonlyValues[key as EntryKey<T>]]
        : undefined
    },
  }) as EnumResult<T>
}

/**
 * Defines an enum-like object while preserving literal values, labels, and
 * per-entry metadata. Prefer this API when consumers require precise types.
 */
export function defineEnum<const T extends EnumDefinition>(
  definition: T
): DefinedEnum<T> {
  const items = getKeys(definition).map((rawKey) => {
    const key = rawKey as EnumKey<T>
    const entry = definition[key]
    return Object.freeze({ key, ...entry }) as EnumItem<T>
  })

  return createEnumResult(items)
}

/**
 * Defines an enum whose string values are derived from uppercase underscore
 * keys. Use this API for stable string protocols such as `kebab-case` values.
 */
export function defineKeyEnum<
  const T extends KeyEnumDefinition,
  const F extends KeyEnumFormat = 'preserve'
>(
  definition: T,
  options?: DefineKeyEnumOptions<F>
): DefinedKeyEnum<T, F> {
  const format = options?.format ?? 'preserve'
  const items = getKeys(definition).map((rawKey) => {
    const key = rawKey as KeyEnumKey<T>
    const entry = definition[key]
    const value = formatKeyEnumValue(key, format)
    return Object.freeze({ ...entry, key, value }) as KeyEnumItem<T, F>
  })

  return createEnumResult(items)
}

/**
 * Defines an enum with generated numeric values. Explicit numeric values may
 * be mixed with generated ones, but generated values are typed as `number`.
 */
export function defineNumberEnum<
  const T extends NumberEnumDefinition,
  const O extends NumberEnumOutput = 'number'
>(
  definition: T,
  options?: DefineNumberEnumOptions<O>
): DefinedNumberEnum<T, O> {
  const start = options?.start ?? 0
  const continueAfterExplicit = options?.continueAfterExplicit ?? false
  const output = options?.output ?? 'number'
  let nextValue = start

  const items = getKeys(definition).map((rawKey, index) => {
    const key = rawKey as NumberEnumKey<T>
    const entry = definition[key]
    const defaultValue = continueAfterExplicit ? nextValue : start + index
    const numericValue = entry.value ?? defaultValue
    nextValue = numericValue + 1

    const value = output === 'string' ? String(numericValue) : numericValue
    return Object.freeze({ ...entry, key, value }) as unknown as NumberEnumItem<
      T,
      O
    >
  })

  return createEnumResult(items)
}

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
      return key.toLowerCase().replace(/_/g, '-')
    default:
      return key
  }
}

function formatKeyEnumValue(key: string, format: KeyEnumFormat): string {
  checkKey(key)
  switch (format) {
    case 'upperCamelCase':
      return key
        .toLowerCase()
        .replace(/(?:^|_)(\w)/g, (_, character) => character.toUpperCase())
    case 'lowerCamelCase':
      return key.toLowerCase().replace(/_(\w)/g, (_, character) => character.toUpperCase())
    case 'snake_case':
      return key.toLowerCase()
    case 'kebab-case':
      return key.toLowerCase().replace(/_/g, '-')
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
    const items: Array<EnumEntry<V> & { extra?: E }> = []
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

      items.push({ key: key as string, label, value, extra })
      return cutsomValue
    })

    const core = createEnumResult(items)
    const values = core.values as unknown as Record<keyof T, V>
    const byValue = core.byValue as unknown as Record<V, EEMapper<T, E, V>>
    const labels = Object.create(null) as Record<V, string>
    const extras = Object.create(null) as Record<V, E | undefined>
    const dict: EEDictOption<E, V>[] = []

    core.options.forEach(({ label, value, extra }) => {
      labels[value] = label
      extras[value] = extra
      dict.push({ label, value, extra })
    })

    const matches = (value: unknown, matchKeys: readonly (keyof T)[]) =>
      matchesEnumValue(values, value, matchKeys)
    const result: EEResult<T, E, V> = {
      bind(value) {
        return {
          in(...keys) {
            return matches(value, keys)
          },
          not(...keys) {
            return !matches(value, keys)
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
            return matches(value, keys)
          },
          not(...keys) {
            const value = getter()
            return !matches(value, keys)
          },
        }
      },
      DICT: dict,
      VALUE: values,
      EXTRA: extras,
      LABEL: labels,
      MAPPER: byValue,
    }
    return result
  }

  return makeEnhancedEnum
}

export const makeEnhancedEnum = genMakeEnhancedEnum<null>()
export const makeEnhancedStringEnum = genMakeEnhancedEnum<null, string>()
export const makeEnhancedNumberEnum = genMakeEnhancedEnum<null, number>()
