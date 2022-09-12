import { defineConfig } from 'vite'
//import vue from '@vitejs/plugin-vue'
import veauryVitePlugins from 'veaury/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    //vue()
    veauryVitePlugins({
      type: 'vue'
    })
  ],
  build: { 
    target: "es2020",
    rollupOptions: {
      external: ["react", "react-dom", "@orbisclub/orbis-sdk"]
    }
   },
  optimizeDeps: {
    esbuildOptions: { target: "es2020", supported: { bigint: true } },
  },
  define: {
    "global": {},
  },
})