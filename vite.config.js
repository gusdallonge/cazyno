import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/user-profiles': 'http://localhost:3001',
      '/game-rounds': 'http://localhost:3001',
      '/support-tickets': 'http://localhost:3001',
      '/users': 'http://localhost:3001',
      '/integrations': 'http://localhost:3001',
      '/rpc': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      '/leaderboard': 'http://localhost:3001',
      '/rewards': 'http://localhost:3001',
      '/audit': 'http://localhost:3001',
      '/affiliates': 'http://localhost:3001',
    },
  },
})
