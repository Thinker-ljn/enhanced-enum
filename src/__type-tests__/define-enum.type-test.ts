import { defineEnum } from '@/enhanced-enum'

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
const valueAssertions: ValueByKey | ValueUnion = true
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
