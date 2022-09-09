# Punk Domains frontend

Punk Domains - Web3 Domains for DAOs

https://punk.domains 

## Quickstart

```bash
npm install
npm run dev
```

## .env

Create the `.env` file with the following keys:

```bash
VITE_ALCHEMY_POLYGON_KEY=value
VITE_ALCHEMY_MUMBAI_KEY=value
VITE_ALCHEMY_OPTIMISM_KEY=value
VITE_ALCHEMY_ARBITRUM_KEY=value
VITE_ALCHEMY_ETHEREUM_KEY=value
```

## Development

Develop on the `develop` branch (or a temporary branch which is then merged to develop). Never develop directly on the `main` branch.

When you want to push your changes to production, merge `develop` branch into the `main` branch.

- Development server: https://punk-domains-develop.netlify.app/ 
- Production server: https://punk.domains/

### Orbis

```bash
npm install @orbisclub/orbis-sdk events
```

es2020 target build & empty global in vite.config.ts:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: ["es2020"]
  },
  define: {
    "global": {},
  },
})
```

Usage in component:

```html
<script lang="ts">
  import { Orbis } from "@orbisclub/orbis-sdk";

  export default {
    name: "About",

    created() {
      this.connectOrbis();
    },

    methods: {
      async connectOrbis() {
        let orbis = new Orbis();
        let res = await orbis.connect();

        /** Check if connection is successful or not */
        if(res.status == 200) {
          console.log("DID LOL: " + res.did);
        } else {
          console.log("Error connecting to Ceramic: ", res);
        }
      }
    }
  }
</script>
```