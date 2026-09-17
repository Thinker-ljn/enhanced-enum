# enhanced-enum

为 TypeScript 应用定义枚举值、UI 选项、标签和业务元数据。一个定义可派生 key 到 value 的映射、value 到条目的映射、选项列表，以及来自接口和 URL 的安全校验。

推荐使用 `defineEnum`。它保留 key、value、label 和扩展字段的字面量类型，并且不需要 `as const`。

## 安装

```bash
pnpm add enhanced-enum
# 或 npm install enhanced-enum
```

## 推荐用法：`defineEnum`

```ts
import { defineEnum } from 'enhanced-enum'

const STATUS = defineEnum({
  SUCCESS: { value: 1, label: '成功', color: 'green' },
  FAIL: { value: 2, label: '失败', color: 'red', retryable: true },
})
```

每个条目都显式声明 `value` 和 `label`，其余字段会原样保留为业务元数据。value 必须在同一枚举内唯一，重复值会在创建时抛出错误。

### 访问映射和选项

```ts
STATUS.VALUE.SUCCESS // 1

STATUS.MAPPER[1]
// { key: 'SUCCESS', value: 1, label: '成功', color: 'green' }

STATUS.options
// [
//   { key: 'SUCCESS', value: 1, label: '成功', color: 'green' },
//   { key: 'FAIL', value: 2, label: '失败', color: 'red', retryable: true },
// ]

STATUS.DICT === STATUS.options // true，DICT 是兼容别名
```

类型会保留关联关系：`STATUS.VALUE.SUCCESS` 的类型是 `1`，`STATUS.get(1)` 的类型精确对应 `SUCCESS` 条目，而不是宽泛的 `string | number` 或所有条目的联合类型。

### 校验外部输入

接口、URL 参数和表单字段通常是 `unknown`。使用守卫后，TypeScript 会收窄为当前枚举的 key 或 value 联合类型。

```ts
function readStatus(input: unknown) {
  if (!STATUS.isValue(input)) {
    return undefined
  }

  return STATUS.get(input)
  // input: 1 | 2
  // 返回 SUCCESS 或 FAIL 对应的条目
}

STATUS.isKey('SUCCESS') // true
STATUS.isKey('UNKNOWN') // false
STATUS.fromKey('FAIL') // FAIL 对应条目
STATUS.fromKey('UNKNOWN') // undefined
STATUS.get(999) // undefined
```

`get` 和 `fromKey` 均可安全接收 `unknown`；传入已知字面量时会保留精确的返回类型。

## Key 派生 value：`defineKeyEnum`

当 value 是稳定字符串协议，并且可以从大写下划线 key 派生时，使用 `defineKeyEnum`。它保留转换后的字符串字面量类型，并替代旧 API 的 `useKeyAsValue`。

```ts
import { defineKeyEnum } from 'enhanced-enum'

const STATUS = defineKeyEnum(
  {
    IN_PROGRESS: { label: 'status.inProgress', color: 'blue' },
    DONE: { label: 'status.done', color: 'green' },
  },
  { format: 'kebab-case' }
)

STATUS.values.IN_PROGRESS // 'in-progress'
STATUS.byValue['in-progress'].key // 'IN_PROGRESS'
```

输入 key 必须是大写下划线格式，例如 `IN_PROGRESS`。`format` 默认是 `'preserve'`，还支持：`'upperCamelCase'`、`'lowerCamelCase'`、`'snake_case'` 和 `'kebab-case'`。

## 自动数字 value：`defineNumberEnum`

当 value 按声明顺序递增，但少数条目需要指定编号时，使用 `defineNumberEnum`。它支持数字或数字字符串输出；自动生成的 value 在类型上是宽泛的 `number` 或 `string`，显式 value 仍保留字面量类型。

```ts
import { defineNumberEnum } from 'enhanced-enum'

const STATUS = defineNumberEnum(
  {
    DRAFT: { label: '草稿' },
    REVIEWING: { value: 10, label: '审核中' },
    PUBLISHED: { label: '已发布' },
  },
  { start: 1, continueAfterExplicit: true, output: 'string' }
)

STATUS.values.DRAFT // '1'
STATUS.values.REVIEWING // '10'，类型为 '10'
STATUS.values.PUBLISHED // '11'
```

`start` 默认是 `0`。`continueAfterExplicit` 默认是 `false`，此时每个自动 value 都由 `start + 声明索引` 决定；设为 `true` 后，显式数字 value 会成为后续自动编号的起点。`output` 默认是 `'number'`，设为 `'string'` 可生成数字字符串。

## 国际化标签

库不管理翻译资源、当前语言或任何 UI 框架集成。多语言项目建议把稳定的 i18n key 放入 `label`，在渲染选项时由调用方翻译。

```ts
const STATUS = defineEnum({
  SUCCESS: { value: 1, label: 'status.success', color: 'green' },
  FAIL: { value: 2, label: 'status.fail', color: 'red' },
})

type Translate = (key: string) => string

function toLocalizedOptions<T extends { label: string }>(
  options: readonly T[],
  translate: Translate
) {
  return options.map(({ label, ...item }) => ({
    ...item,
    label: translate(label),
  }))
}

declare const translate: Translate

toLocalizedOptions(STATUS.options, translate)
// 当前语言：[
//   { key: 'SUCCESS', value: 1, label: 'Success', color: 'green' },
//   { key: 'FAIL', value: 2, label: 'Failure', color: 'red' },
// ]
```

切换语言只需传入不同的 `translate` 函数；`value`、key 和业务元数据保持稳定。Vue I18n、i18next、FormatJS 或自定义翻译函数都可以实现 `Translate`，因此本库不需要引入它们的运行时依赖。

若标签本身必须是后端返回的中文或其他展示文本，也可以直接存储展示文本。i18n key 是多语言场景的推荐约定，不是强制格式。

## 从旧 API 迁移

`makeEnhancedEnum`、`makeEnhancedStringEnum`、`makeEnhancedNumberEnum` 和 `genMakeEnhancedEnum` 继续受支持，不会因 `defineEnum` 而移除。它们适合以下情况：

- 项目已大量使用 tuple 定义，短期内不计划迁移。
- 依赖 `bind` 或 `bindGetter` 的条件判断。

新代码优先使用 `defineEnum`；需要 key 派生字符串时使用 `defineKeyEnum`，需要自动数字编号时使用 `defineNumberEnum`。这些 API 避免 tuple 位置语义，并尽可能保留每个 value 与条目元数据的精确类型。

| 旧 API | 现代 API |
| --- | --- |
| `SUCCESS: ['成功', 1, { color: 'green' }]` | `SUCCESS: { value: 1, label: '成功', color: 'green' }` |
| `makeEnhancedStringEnum` | value 显式时使用 `defineEnum`；可由 key 派生时使用 `defineKeyEnum` |
| `makeEnhancedNumberEnum` | `defineNumberEnum` |
| `genMakeEnhancedEnum<Extra>()` | 在 `defineEnum` 条目中直接声明扩展字段 |
| `STATUS.VALUE.SUCCESS` 是宽泛 value 类型 | `STATUS.VALUE.SUCCESS` 是字面量 `1` |
| `DICT` 为 `{ value, label, extra }[]` | `options` 为保留每项元数据的只读数组 |
| `useKeyAsValue` | `defineKeyEnum(..., { format })` |
| `offset` | `defineNumberEnum(..., { start })` |
| `autoIncrementAfterAlias` | `defineNumberEnum(..., { continueAfterExplicit: true })` |
| `useStringNumberValue` | `defineNumberEnum(..., { output: 'string' })` |
| `bind(value).in('SUCCESS', 'FAIL')` | `STATUS.matches(value, 'SUCCESS', 'FAIL')` |
| `bindGetter(() => state.status)` | 先读取 `const value = state.status`，再调用 `STATUS.matches(value, ...)` |

`matches` 用于已取得 value 的枚举分支判断；`isValue`、`get` 和 `fromKey` 仍适合处理接口、URL 等外部输入和查找。`bind` 与 `bindGetter` 继续兼容，但不建议在新代码中使用。尤其是 `bindGetter` 会在每次 `in` 或 `not` 时重新读取 getter，它不提供 Vue、React 或其他框架的响应式订阅。

```ts
const value = state.status

if (STATUS.matches(value, 'SUCCESS', 'FAIL')) {
  // value 来自同一时刻的明确快照
}
```

在具备上述等价迁移路径前，旧 API 不标记为弃用。

### 旧 API 示例

```ts
import { EEKeyValueType, genMakeEnhancedEnum, makeEnhancedEnum } from 'enhanced-enum'

const STATUS = makeEnhancedEnum(
  {
    SUCCESS: '成功',
    FAIL: ['失败', 1000],
  },
  { offset: 1 }
)

STATUS.VALUE.SUCCESS // 1
STATUS.VALUE.FAIL // 1000

const STATUS_WITH_EXTRA = genMakeEnhancedEnum<{ color: string }>()({
  SUCCESS: ['成功', { color: 'green' }],
  FAIL: ['失败', { color: 'red' }],
})

const KEY_VALUE_STATUS = makeEnhancedEnum(
  { IN_PROGRESS: '进行中' },
  { useKeyAsValue: EEKeyValueType.KEBAB_CASE }
)

KEY_VALUE_STATUS.VALUE.IN_PROGRESS // 'in-progress'
```

旧 API 输入格式：

- `{ SUCCESS: '成功' }`：使用索引作为默认 value。
- `{ SUCCESS: ['成功', 1000] }`：指定 value。
- `genMakeEnhancedEnum<Extra>()({ SUCCESS: ['成功', extra] })`：指定扩展字段。
- `{ SUCCESS: ['成功', 1000, extra] }`：同时指定 value 和扩展字段。

`EEConfig` 支持：

- `offset`：默认数字 value 的起点，默认 `0`。
- `useStringNumberValue`：将数字 value 转为字符串。
- `autoIncrementAfterAlias`：指定数字 value 后，使后续默认 value 从该值继续递增。
- `useKeyAsValue`：使用 key 作为 value，可配合 `EEKeyValueType` 转为 Camel、snake 或 kebab 格式。

## 开发与验证

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm verify:package
```

`verify:package` 会打包当前产物，并在独立 ESM/CJS TypeScript 消费者中安装、编译和运行它，以验证 `exports`、声明文件和两种模块加载方式。需要在编辑器中检查该临时消费者时，使用 `pnpm verify:package:keep`。

## 发布

真实发布使用 `release-it`：

```bash
pnpm release
```

本地只演练发布流程，不发布 npm 包也不推送 tag：

```bash
pnpm release:dry-run --ci patch
```
