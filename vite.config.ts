import path from 'path'
import { defineConfig } from 'vite'
import { name as PackageName } from './package.json'

const camelCaseName = PackageName.replace(/-[a-zA-Z]/g, (m) =>
  m.slice(1).toUpperCase()
)
const prod = process.env.NODE_ENV === 'production'
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: camelCaseName,
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `${PackageName}.${format}${prod ? '.min' : ''}.js`,
    },
    minify: prod,
    emptyOutDir: prod,
  },
})
