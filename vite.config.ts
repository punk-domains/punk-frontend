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
    target: "esnext",
    rollupOptions: {
      external: [
        /*
        "react", 
        "react-dom", 
        "@orbisclub/orbis-sdk", 
        "@orbisclub/orbis-sdk/utils/index.js", 
        "ethereum-blockies-base64"
        */
      ]
    }
   },
  optimizeDeps: {
    esbuildOptions: { 
      target: "esnext", 
      supported: { 
        bigint: true 
      },
      define: {
        global: 'globalThis'
      }
    },
  },
  /*define: {
    "global": {},
  },*/
})