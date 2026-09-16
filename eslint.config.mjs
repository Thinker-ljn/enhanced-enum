import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.local/**',
      'graft/**',
      '.prettierrc.cjs',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'fixtures/**/*.{ts,mts,cts}', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['fixtures/**/*.cts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier
)
