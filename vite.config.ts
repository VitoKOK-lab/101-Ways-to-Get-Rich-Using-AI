import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/101-Ways-to-Get-Rich-Using-AI/' : '/',
}))
