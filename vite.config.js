import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/growth-tracker/',   // ← これを変更（末尾の / を忘れずに）
})