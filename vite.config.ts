import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import icalHandler from './api/ical'

/** No `npm run dev`, serve as funções de /api do mesmo jeito que a Vercel. */
const devApi = (): Plugin => ({
  name: 'mova-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/ical', async (req, res) => {
      try {
        const r = await icalHandler(new Request(`http://localhost${req.originalUrl ?? req.url}`))
        res.statusCode = r.status
        r.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await r.text())
      } catch (e) {
        res.statusCode = 502
        res.end(String(e))
      }
    })
  },
})

// `--mode single` gera um único index.html (útil para compartilhar/hospedar estático)
export default defineConfig(({ mode }) => ({
  resolve: { alias: { '@': '/src' } },
  plugins: [react(), devApi(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000 } : {},
}))
