import { defineEnum, defineKeyEnum, defineNumberEnum } from '@/enhanced-enum'

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <
  Value
>() => Value extends Right ? 1 : 2
  ? true
  : false
type Expect<Value extends true> = Value

const STATUS = defineEnum({
  SUCCESS: { value: 1, label: '成功', color: 'green' },
  FAIL: { value: 2, label: '失败', retryable: true },
})

type ValueByKey = Expect<Equal<typeof STATUS.VALUE.SUCCESS, 1>>
type ValueUnion = Expect<Equal<(typeof STATUS.VALUE)[keyof typeof STATUS.VALUE], 1 | 2>>
type RecommendedValueByKey = Expect<Equal<typeof STATUS.values.SUCCESS, 1>>
type RecommendedValueUnion = Expect<
  Equal<(typeof STATUS.values)[keyof typeof STATUS.values], 1 | 2>
>
const valueAssertions:
  | ValueByKey
  | ValueUnion
  | RecommendedValueByKey
  | RecommendedValueUnion = true
void valueAssertions

const success = STATUS.get(1)
if (success) {
  const successKey: Expect<Equal<typeof success.key, 'SUCCESS'>> = true
  const successLabel: Expect<Equal<typeof success.label, '成功'>> = true
  const successColor: Expect<Equal<typeof success.color, 'green'>> = true
  void successKey
  void successLabel
  void successColor
}

type Option = (typeof STATUS.options)[number]
type OptionKeys = Expect<Equal<Option['key'], 'SUCCESS' | 'FAIL'>>
const optionAssertion: OptionKeys = true
void optionAssertion

const failure = STATUS.byValue[2]
const failureKey: Expect<Equal<typeof failure.key, 'FAIL'>> = true
const failureRetryable: Expect<Equal<typeof failure.retryable, true>> = true
void failure
void failureKey
void failureRetryable

declare const externalKey: unknown
if (STATUS.isKey(externalKey)) {
  const narrowedKey: Expect<Equal<typeof externalKey, 'SUCCESS' | 'FAIL'>> = true
  void narrowedKey
}

declare const externalValue: unknown
if (STATUS.isValue(externalValue)) {
  const narrowedValue: Expect<Equal<typeof externalValue, 1 | 2>> = true
  void narrowedValue
}

// @ts-expect-error undefined keys must not be accepted by the key-to-value map.
void STATUS.VALUE.UNKNOWN

// @ts-expect-error a defined item's value must retain its literal type.
const invalidValue: 3 = STATUS.VALUE.SUCCESS
void invalidValue

const KEY_STATUS = defineKeyEnum(
  {
    IN_PROGRESS: { label: '进行中', color: 'blue' },
    DONE: { label: '完成', color: 'green' },
  },
  { format: 'kebab-case' }
)

const keyValue: Expect<
  Equal<typeof KEY_STATUS.values.IN_PROGRESS, 'in-progress'>
> = true
const keyItem = KEY_STATUS.byValue['in-progress']
const keyItemType: Expect<Equal<typeof keyItem.key, 'IN_PROGRESS'>> = true
const keyItemColor: Expect<Equal<typeof keyItem.color, 'blue'>> = true
void keyValue
void keyItem
void keyItemType
void keyItemColor

const CAMEL_STATUS = defineKeyEnum(
  { IN_PROGRESS: { label: '进行中' } },
  { format: 'lowerCamelCase' }
)
const camelValue: Expect<
  Equal<typeof CAMEL_STATUS.values.IN_PROGRESS, 'inProgress'>
> = true
void CAMEL_STATUS
void camelValue

// @ts-expect-error key-derived enum entries must not supply their own value.
defineKeyEnum({ SUCCESS: { value: 'success', label: '成功' } })

const NUMBER_STATUS = defineNumberEnum({
  DRAFT: { label: '草稿' },
  REVIEWING: { value: 10, label: '审核中' },
})

const generatedNumberValue: Expect<
  Equal<typeof NUMBER_STATUS.values.DRAFT, number>
> = true
const explicitNumberValue: Expect<
  Equal<typeof NUMBER_STATUS.values.REVIEWING, 10>
> = true
const numberItem = NUMBER_STATUS.fromKey('REVIEWING')
if (numberItem) {
  const numberItemValue: Expect<Equal<typeof numberItem.value, 10>> = true
  void numberItemValue
}
void generatedNumberValue
void explicitNumberValue

const STRING_NUMBER_STATUS = defineNumberEnum(
  { REVIEWING: { value: 10, label: '审核中' } },
  { output: 'string' }
)
const stringNumberValue: Expect<
  Equal<typeof STRING_NUMBER_STATUS.values.REVIEWING, '10'>
> = true
void STRING_NUMBER_STATUS
void stringNumberValue

// @ts-expect-error number-generated enum entries only accept numeric aliases.
defineNumberEnum({ REVIEWING: { value: '10', label: '审核中' } })
