import { defineEnum, makeEnhancedEnum } from 'enhanced-enum'

const STATUS = defineEnum({
  SUCCESS: { value: 1, label: 'success', color: 'green' },
  FAIL: { value: 2, label: 'failure', color: 'red' },
})

// @ts-expect-error the package declaration must preserve the literal value.
const invalidStatusValue: 3 = STATUS.VALUE.SUCCESS
void invalidStatusValue

const item = STATUS.get(STATUS.VALUE.SUCCESS)
if (!item || item.key !== 'SUCCESS' || item.color !== 'green') {
  throw new Error('ESM consumer could not use defineEnum')
}

if (makeEnhancedEnum({ READY: 'ready' }).VALUE.READY !== 0) {
  throw new Error('ESM consumer could not use makeEnhancedEnum')
}
