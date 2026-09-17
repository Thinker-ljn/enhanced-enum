## [0.4.1](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.4.0...v0.4.1) (2022-06-20)



# [0.4.0](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.3.0...v0.4.0) (2021-11-04)


### Features

* add props `useStringNumberValue` ([737320f](https://github.com/Thinker-ljn/enhanced-enum/commit/737320facef245f3f0c0ba435829c3a710376c07))



# [0.3.0](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.2.0...v0.3.0) (2021-11-03)


### Features

* add props `autoIncrementAfterAlias` ([9e18b6c](https://github.com/Thinker-ljn/enhanced-enum/commit/9e18b6cfbeea69fa30d04744880a7d7ddd2ce3bf))



# [0.2.0](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.1.1...v0.2.0) (2021-11-01)


### Features

* bind/bindGeter ([bd365c2](https://github.com/Thinker-ljn/enhanced-enum/commit/bd365c2aae9e13d0795521445806005cfe3c1e83))
* use key as value ([36159bd](https://github.com/Thinker-ljn/enhanced-enum/commit/36159bd304fd6190b7f00d552b06a6804e3abc01))



## [0.1.1](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.1.0...v0.1.1) (2021-09-26)



# 0.1.0 (2021-09-26)


### Features

* enhanced-enum ([0e8e5d0](https://github.com/Thinker-ljn/enhanced-enum/commit/0e8e5d0f905d32bb9073747d88967c413a11bb3a))


## [Unreleased]

### 1.0.0 release notes

#### Added

- `defineEnum`, `defineKeyEnum`, and `defineNumberEnum` provide literal-preserving enum definitions, safe lookup guards, and `matches(value, ...keys)` for explicit branch matching.
- Published ESM and CommonJS fixtures verify the modern API and all supported legacy constructors from the packed tarball.

#### Changed

- `makeEnhancedEnum`, `makeEnhancedStringEnum`, `makeEnhancedNumberEnum`, and `genMakeEnhancedEnum` remain supported. `bind` and `bindGetter` remain compatible; new code should use `matches` with an explicitly read value.
- Legacy tuple definitions now use the same duplicate-value validation as modern definitions. A repeated value throws `Duplicate enum value: <value>` during construction.

#### Breaking changes reviewed for 1.0.0

- Node.js 22 or later and pnpm 10 or later are required by the published package toolchain.
- Legacy definitions with duplicate values are rejected at construction time. Replace duplicates with distinct values before upgrading.
- `KeyValueType` remains deprecated in favor of `EEKeyValueType`; modern code should replace key-derived legacy configuration with `defineKeyEnum` and its `format` option.

