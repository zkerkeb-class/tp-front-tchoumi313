import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const backendUrl = env.VITE_API_URL

  const devOnlyProxy = mode === 'development' 
    ? {
        '/assets': {
          target: backendUrl,
          changeOrigin: true,
        },
      }
    : {}

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        ...devOnlyProxy,
      },
    },
    preview: {
      host: true,
      port: parseInt(process.env.PORT) || 5173,
      allowedHosts: ['tp-front-tchoumi313.onrender.com']
    },
  }
})
