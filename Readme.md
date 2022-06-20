# enhanced enum

一个集成定义枚举（ENUM），映射（MAPPER/LABEL/VALUE），中文字典（DICT/OPTIONS）及拓展字段的库，在 `typescript` 下有类型提示。

## 一个简单的例子
```ts
import {
  makeEnhancedEnum,
} from 'enhanced-enum'

const STATUS = makeEnhancedEnum(
  {
    /** 成功 */
    SUCCESS: ['成功', { color: 'green' }],
    /** 失败 */
    FAIL: ['失败', { color: 'red' }]
  },
  1 // default 0
)
// 相当于：
const STATUS = {
  VALUE: {
    SUCCESS: 1,
    FAIL: 2
  },
  LABEL: {
    1: '成功',
    2: '失败'
  },
  DICT: [
    { value: 1, label: '成功', extra: { color: 'green' } },
    { value: 2, label: '失败', extra: { color: 'red' } }
  ],
  EXTRA: {
    1: { color: 'green' },
    2: { color: 'red' }
  },
  MAPPER: {
    1: {
      key: 'SUCCESS',
      label: '成功',
      value: 1,
      extra: { color: 'green' },
    },
    2: {
      key: 'FAIL',
      label: '失败',
      value: 2,
      extra: { color: 'red' },
    }
  },
  bindGetter () { /** */ },
  bind () { /** */ },
}
```
## 安装

```
yarn add enhanced-enum

npm i enhanced-enum
```

## 可用方法与参数

### makeEnhancedEnum(input, config)

类型见[这个文件](./src/enhanced-enum.ts)的 `makeEnhancedEnum`

- `input` 接收一个对象，对象的每行定义：值默认为标签，用于UI界面可读；键值只用于程序可读；Object.keys返回的索引为默认值，用于前后端通信；
  - 简单使用 `{ SUCCESS: '成功' }`
  - 自定义值（忽略索引） `{ SUCCESS: ['成功', 1000] }`
  - 自定义额外参数 `{ SUCCESS: ['成功', { color: 'green' }] }`
  - 自定义值（忽略索引）及额外参数 `{ SUCCESS: ['成功', 1000, { color: 'green' }] }`
- `config` 接收一个数字或对象，数字代表索引默认值的偏移，对象的参数如下
  - `offset` 索引偏移，默认 0
  - `useStringNumberValue` 把索引值转能字符串格式（0 -> '0'）
  - `autoIncrementAfterAlias` 当为某个枚举项自定义值时，自动为后续的枚举项的值进行自增
  - `useKeyAsValue` 忽略索引值，把键值当成值，有四种转换格式（见下方 EEKeyValueType）

```ts
export enum EEKeyValueType {
  UPPER_CAMEL_CASE = 'UPPER_CAMEL_CASE', // UpperCamelCase
  LOWER_CAMEL_CASE = 'LOWER_CAMEL_CASE', // lowerCamelCase
  SNAKE_CASE = 'SNAKE_CASE', // snake_case
  KEBAB_CASE = 'KEBAB_CASE', // kebab-case
}
```

#### 函数返回

该函数返回一个对象，类型见[这个文件](./src/enhanced-enum.ts)的 `EEResult`

### makeEnhancedStringEnum

用法同上，只是在 `typescript` 下值的类型强制为字符串
### makeEnhancedNumberEnum

用法同上，只是在 `typescript` 下值的类型强制为数字
### genMakeEnhancedEnum\<Extra, Value>()

用于 `typescript` 自定义额外参数的类型，及值的类型


## 类型提示

由于并未使用 `typescript` 的 `枚举enum`，类型提示稍显不足，比如值只能提示为数字或者字符串，label 只能通过注释来提示（见下方例子）

```ts
const STATUS = makeEnhancedEnum(
  {
    SUCCESS: '成功',
    FAIL: ['失败', { color: 'red' }]
  }
)
// 使用下面的正式可生成提示
// 匹配： ((?:\{|,)\n)(\s+)([A-Z_]+:[^']+'([^']+)?')
// 替换： $1$2/** $4 */\n$2$3
const STATUS = makeEnhancedEnum(
  {
    /** 成功 */
    SUCCESS: '成功',
    /** 失败 */
    FAIL: ['失败', { color: 'red' }]
  }
)
```
## 其他例子及用法

[测试用例](./src/__tests__/enhanced-enum.spec.ts)
