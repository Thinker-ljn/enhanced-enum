# Changelog

# [1.0.0-alpha.0](https://github.com/Thinker-ljn/enhanced-enum/compare/v0.4.1...v1.0.0-alpha.0) (2026-09-17)

### Bug Fixes

* convert all kebab-case separators ([fa083bd](https://github.com/Thinker-ljn/enhanced-enum/commit/fa083bd5aa09dd3dfaffa492b1b9f23eb51bc338))
* publish a valid CommonJS entry ([7d4a926](https://github.com/Thinker-ljn/enhanced-enum/commit/7d4a92668650aae8c89cea095ff3afd42cb4a814))
* resolve ESM declaration entry ([fdf70b6](https://github.com/Thinker-ljn/enhanced-enum/commit/fdf70b6be0bbee2081653e4fe5cd47fb1d6cbed0))

### Features

* add enum lookup guards ([a30fcba](https://github.com/Thinker-ljn/enhanced-enum/commit/a30fcbacf106def42c636d00cd500d29a5286b69))
* add enum match helpers ([385c0ab](https://github.com/Thinker-ljn/enhanced-enum/commit/385c0ab6daa0c79838eb9e4c7df36fea38c5c0d9))
* add generated number enum definitions ([5e322fa](https://github.com/Thinker-ljn/enhanced-enum/commit/5e322faeb8dcc56ed022b0e61d35aafed76dd545))
* add key-derived enum definitions ([ced5498](https://github.com/Thinker-ljn/enhanced-enum/commit/ced549886ae0e0a50eee6688c38babedbfe54d2a))
* add literal-preserving enum API ([32fd18e](https://github.com/Thinker-ljn/enhanced-enum/commit/32fd18e0a2fb20367248a93d5fe544b1306b64f2))

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
