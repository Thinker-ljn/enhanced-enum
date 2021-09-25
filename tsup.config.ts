import type { Options } from 'tsup'
export const tsup: Options = {
  entryPoints: ['src/index.ts'],
  dts: true,
}
