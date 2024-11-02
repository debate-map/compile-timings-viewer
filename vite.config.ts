import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const generateBuildId = () => {
  return Date.now().toString();
}

const buildId = generateBuildId()
export default defineConfig({
  plugins: [react()],
  base: "/compile-timings",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${buildId}.js`,
        chunkFileNames: `assets/[name]-${buildId}.js`,
        assetFileNames: `assets/[name]-${buildId}.[ext]`
      }
    }
  }
})
