import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

/** 开发 / 预览端口（和 fastapi-admin-frontend 错开：那边占 5173 / 4173） */
const DEV_PORT = 5180
const PREVIEW_PORT = 4180

/**
 * dev / preview 的服务器配置。
 *
 * ⚠️ 端口写死在这儿、**不要**跟着代理一起条件返回：一旦没配 `VITE_PROXY_TARGET` 就整段省掉
 * `server`，Vite 会退回默认的 5173 —— 和隔壁 fastapi-admin-frontend 撞端口。
 */
function buildServer(target) {
  // 后端地址没配就只是不开代理，端口照旧
  const proxy = target ? { '/api': { target, changeOrigin: true } } : {}
  return {
    server: { host: '0.0.0.0', port: DEV_PORT, open: false, proxy },
    preview: { host: '0.0.0.0', port: PREVIEW_PORT, proxy },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 后端地址走环境变量 VITE_PROXY_TARGET（见 .env.example），没配就不开代理
    ...buildServer(env.VITE_PROXY_TARGET),
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          /**
           * 把 vue 那一套单独拆一个 chunk（浏览器好缓存）。
           *
           * ⚠️ Vite 6+ 底层换成了 rolldown，`manualChunks` **只认函数形式** —— 写成
           * `{ vue: ['vue', ...] }` 那种对象会在打包时直接报 `manualChunks is not a function`。
           */
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/.test(id)) {
              return 'vue'
            }
          },
        },
      },
    },
  }
})
