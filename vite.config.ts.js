// vite.config.ts
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// package.json
var name = 'enhanced-enum'

// vite.config.ts
var camelCaseName = name.replace(/-[a-zA-Z]/g, (m) => m.slice(1).toUpperCase())
var prod = process.env.NODE_ENV === 'production'
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: path.resolve('D:\\_T\\_code\\enhanced-enum', 'src/index.ts'),
      name: camelCaseName,
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `${name}.${format}${prod ? '.min' : ''}.js`,
    },
    minify: prod,
    emptyOutDir: prod,
  },
  plugins: [
    dts({
      logDiagnostics: true,
      afterDiagnostic(diagnostics) {
        console.log(diagnostics)
      },
      beforeWriteFile(filePath, content) {
        console.log(filePath, content)
      },
    }),
  ],
})
export { vite_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJ1xyXG5pbXBvcnQgeyBuYW1lIGFzIFBhY2thZ2VOYW1lfSBmcm9tICcuL3BhY2thZ2UuanNvbidcclxuXHJcbmNvbnN0IGNhbWVsQ2FzZU5hbWUgPSBQYWNrYWdlTmFtZS5yZXBsYWNlKC8tW2EtekEtWl0vZywgKG0pID0+IG0uc2xpY2UoMSkudG9VcHBlckNhc2UoKSlcclxuY29uc3QgcHJvZCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbidcclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBidWlsZDoge1xyXG4gICAgbGliOiB7XHJcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoXCJEOlxcXFxfVFxcXFxfY29kZVxcXFxlbmhhbmNlZC1lbnVtXCIsICdzcmMvaW5kZXgudHMnKSxcclxuICAgICAgbmFtZTogY2FtZWxDYXNlTmFtZSxcclxuICAgICAgZm9ybWF0czogWydlcycsICdjanMnLCAndW1kJ10sXHJcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgJHtQYWNrYWdlTmFtZX0uJHtmb3JtYXR9JHtwcm9kID8gJy5taW4nIDogJyd9LmpzYCxcclxuICAgIH0sXHJcbiAgICBtaW5pZnk6IHByb2QsXHJcbiAgICBlbXB0eU91dERpcjogcHJvZCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtkdHMoe1xyXG4gICAgbG9nRGlhZ25vc3RpY3M6IHRydWUsXHJcbiAgICBhZnRlckRpYWdub3N0aWMgKGRpYWdub3N0aWNzKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGRpYWdub3N0aWNzKVxyXG4gICAgfSxcclxuICAgIGJlZm9yZVdyaXRlRmlsZShmaWxlUGF0aCwgY29udGVudCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhmaWxlUGF0aCwgY29udGVudClcclxuICAgIH1cclxuICB9KV1cclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFDQTtBQUNBOzs7Ozs7QUFHQSxJQUFNLGdCQUFnQixLQUFZLFFBQVEsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUc7QUFDMUUsSUFBTSxPQUFPLFFBQVEsSUFBSSxhQUFhO0FBQ3RDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sS0FBSyxRQUFRLGdDQUFnQztBQUFBLE1BQ3BELE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxNQUFNLE9BQU87QUFBQSxNQUN2QixVQUFVLENBQUMsV0FBVyxHQUFHLFFBQWUsU0FBUyxPQUFPLFNBQVM7QUFBQTtBQUFBLElBRW5FLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQTtBQUFBLEVBRWYsU0FBUyxDQUFDLElBQUk7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFpQixhQUFhO0FBQzVCLGNBQVEsSUFBSTtBQUFBO0FBQUEsSUFFZCxnQkFBZ0IsVUFBVSxTQUFTO0FBQ2pDLGNBQVEsSUFBSSxVQUFVO0FBQUE7QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=
