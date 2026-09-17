# Framework Adapter Design

## Decision

`enhanced-enum` remains a pure TypeScript package with no Vue or React runtime dependency. This document records the boundary for optional framework adapters; it does not introduce an adapter package or change the core API.

The core package owns enum definition, lookup, validation, and matching. Framework code owns state reads, dependency tracking, render lifecycles, and SSR behavior. In particular, `bindGetter` is a legacy compatibility helper, not a reactive primitive.

## Vue Direction

An optional `@enhanced-enum/vue` package may be considered when multiple production Vue applications duplicate the same computed wrappers. It must declare Vue as a peer dependency and keep it out of the core package.

The initial surface should stay small:

```ts
const item = useEnumItem(STATUS, () => form.status)
item.value?.key
item.value?.color

const isSuccess = useEnumMatch(STATUS, status, 'SUCCESS')
isSuccess.value
```

`useEnumItem` should return a Vue `ComputedRef` derived from `STATUS.get(toValue(value))`. `useEnumMatch` should return a `ComputedRef<boolean>` derived from `STATUS.matches(toValue(value), ...keys)`. Inputs may accept a `Ref`, `ComputedRef`, or getter only when their semantics and type inference are covered by Vue-level tests.

The adapter must document its treatment of invalid values, `undefined`, SSR, and getter evaluation. Dependency collection must happen inside Vue `computed`; the core package must never call an arbitrary getter to simulate reactivity.

## React Direction

React components already read the current value during render, so direct core calls are the recommended path:

```tsx
const item = STATUS.get(status)
const canRetry = item?.key === 'FAIL' && item.retryable
```

Do not publish `@enhanced-enum/react` for a thin `useMemo` wrapper. Consider a React package only after a measured need for shared selectors, a consistent hook contract across projects, or behavior that cannot be expressed with direct `get` and `matches` calls.

## Legacy Helpers

`bind(value).in(...)` and `bindGetter(getter)` remain compatible in the core package. New code should read a value once and use `matches` explicitly:

```ts
const value = state.status
const isTerminal = STATUS.matches(value, 'SUCCESS', 'FAIL')
```

Framework adapters must read and track state in their own framework lifecycle rather than delegating that responsibility to `bindGetter`.

## Implementation Gate

Implement an adapter only when all of the following are true:

- At least one real Vue project repeats the same enum computed wrapper, or a React use case has a demonstrated need beyond direct core calls.
- The package has explicit input, output, invalid-value, SSR, and peer-dependency contracts.
- Framework-level tests prove reactive updates and type inference for Vue, or prove concrete value beyond direct calls for React.
- The core package remains free of Vue and React runtime dependencies.
