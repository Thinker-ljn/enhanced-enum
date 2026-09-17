import {
  defineEnum,
  defineKeyEnum,
  defineNumberEnum,
  makeEnhancedEnum,
} from 'enhanced-enum'

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

const KEY_STATUS = defineKeyEnum(
  { IN_PROGRESS: { label: 'in progress' } },
  { format: 'kebab-case' }
)

// @ts-expect-error the key-derived value must remain a literal string.
const invalidKeyStatusValue: 'done' = KEY_STATUS.values.IN_PROGRESS
void invalidKeyStatusValue

if (KEY_STATUS.values.IN_PROGRESS !== 'in-progress') {
  throw new Error('ESM consumer could not use defineKeyEnum')
}

const NUMBER_STATUS = defineNumberEnum(
  {
    DRAFT: { label: 'draft' },
    REVIEWING: { value: 10, label: 'reviewing' },
    PUBLISHED: { label: 'published' },
  },
  { start: 1, continueAfterExplicit: true, output: 'string' }
)

// @ts-expect-error explicit numeric values must become literal strings.
const invalidNumberStatusValue: '11' = NUMBER_STATUS.values.REVIEWING
void invalidNumberStatusValue

if (
  NUMBER_STATUS.values.DRAFT !== '1' ||
  NUMBER_STATUS.values.REVIEWING !== '10' ||
  NUMBER_STATUS.values.PUBLISHED !== '11'
) {
  throw new Error('ESM consumer could not use defineNumberEnum')
}
