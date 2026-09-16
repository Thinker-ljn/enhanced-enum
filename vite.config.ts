import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json' with { type: 'json' }

const camelCaseName = packageJson.name.replace(/-[a-zA-Z]/g, (m) =>
  m.slice(1).toUpperCase()
)
const prod = process.env.NODE_ENV === 'production'
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: camelCaseName,
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `${packageJson.name}.${format}.js`,
    },
    minify: prod,
    emptyOutDir: true,
  },
})
