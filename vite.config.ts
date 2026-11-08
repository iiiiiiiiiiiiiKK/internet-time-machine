import tailwindcss from '@tailwindcss/postcss'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Local CDX proxy.
 *
 * Production serves `/cdx` from the Cloudflare Pages Function in
 * `functions/cdx.ts`. That runtime does not exist under `vite dev` or `vite
 * preview`, so this plugin mounts the *same* validation core
 * (`functions/lib/cdx-core.ts`) as connect middleware — identical rules, so
 * local behaviour cannot drift from production.
 */
function cdxLocalProxy(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { buildUpstreamUrl, CACHE_TTL_SECONDS, takeToken } = await import(
        './functions/lib/cdx-core.ts'
      )
      const host = req.headers.host ?? 'localhost'
      const search = new URL(req.url ?? '/', `http://${host}`).searchParams

      const ip = (req.socket.remoteAddress ?? 'local').replace(/^::ffff:/, '')
      if (!takeToken(ip)) {
        res.statusCode = 429
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Retry-After', '5')
        res.end(JSON.stringify({ error: 'rate_limited', message: 'Too many requests.' }))
        return
      }

      const built = buildUpstreamUrl(search)
      if (!built.ok) {
        res.statusCode = built.status
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: built.code, message: built.message }))
        return
      }

      const upstream = await fetch(built.url, {
        headers: {
          'User-Agent':
            'InternetTimeMachine/1.0 (+https://github.com/iiiiiiiiiiiiiKK/internet-time-machine)',
          Accept: 'application/json, text/plain, */*',
        },
        signal: AbortSignal.timeout(25000),
      })

      const body = await upstream.text()
      res.statusCode = upstream.status
      res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', `public, max-age=60, s-maxage=${CACHE_TTL_SECONDS}`)
      res.setHeader('X-ITM-Cache', 'LOCAL')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.end(
        upstream.ok
          ? body
          : JSON.stringify({ error: 'upstream_status', message: `HTTP ${upstream.status}` }),
      )
    } catch (err) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'proxy_error', message: (err as Error).message }))
    }
  }

  return {
    name: 'itm-cdx-local-proxy',
    configureServer(server) {
      server.middlewares.use('/cdx', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/cdx', handler)
    },
  }
}

export default defineConfig({
  plugins: [react(), cdxLocalProxy()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
})