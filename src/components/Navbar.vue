<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img src="../assets/logo.png" alt="" width="30" class="d-inline-block align-bottom navbar-img">
        Punk Domains
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        
        <div class="d-flex ms-auto">
          <div v-if="isActivated" class="">
          
            <div class="btn-group mx-2">
              <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                {{getNetworkName}}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <span 
                    class="dropdown-item" 
                    v-for="network in getSupportedNetworkNames"
                    @click="changeNetwork(network)"
                  >{{network}}</span>
                </li>
              </ul>
            </div>

            <div class="btn-group mx-2">
              <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                {{ getNameOrAddress }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                <router-link tag="li" class="dropdown-item" to="/profile">Profile</router-link>
                <router-link tag="li" class="dropdown-item" to="/">Buy domain</router-link>
                <router-link tag="li" class="dropdown-item" to="/search-domain">Search domain</router-link>
                <router-link tag="li" class="dropdown-item" to="/send-tokens">Send tokens</router-link>
                <router-link tag="li" class="dropdown-item" to="/browser">Browser extension</router-link>
              </ul>
            </div>
          </div>

          <button v-else class="btn btn-primary" @click="open">Connect wallet</button>
        </div>

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { useBoard, useEthers } from 'vue-dapp'

export default {
  name: "Navbar",

  computed: {
    ...mapGetters("user", ["getUserShortAddress", "getUserSelectedName"]),
    ...mapGetters("network", ["getNetworkName", "getSupportedNetworks", "getSupportedNetworkNames"]),

    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserShortAddress;
      }
    },

  },

  methods: {
    changeNetwork(networkName) {
      let method;
      let params;

      if (networkName == "Ropsten") {
        method = "wallet_switchEthereumChain"
        params = [{ chainId: "0x3" }] 
      } else if (networkName == "Mumbai") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://mumbai.polygonscan.com" ],
          chainId: "0x13881",
          chainName: "Mumbai Testnet",
          nativeCurrency: { decimals: 18, name: "Matic", symbol: "MATIC" }, 
          rpcUrls: ["https://matic-mumbai.chainstacklabs.com"]
        }] 
      } else if (networkName == "Arbitrum Testnet") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://rinkeby-explorer.arbitrum.io/" ],
          chainId: "0x66EEB",
          chainName: "Arbitrum Testnet",
          nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
          rpcUrls: ["https://rinkeby.arbitrum.io/rpc"]
        }] 
      } else if (networkName == "Optimism Testnet") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://kovan-optimistic.etherscan.io/" ],
          chainId: "0x45",
          chainName: "Optimism Testnet",
          nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
          rpcUrls: ["https://kovan.optimism.io"]
        }] 
      }

      window.ethereum.request({ 
        method: method, 
        params: params
      });
    }
  },
  
  setup() {
    const { open } = useBoard()
    const { isActivated } = useEthers()

    return {
      isActivated, open
    }
  }
}
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
}

.navbar-brand {
  font-family: 'Cyber', cursive;
}

.navbar-dark .navbar-brand {
  color: #DBDFEA;
}

.navbar-dark {
  /*background-color: #24263A;*/
  background: linear-gradient(90deg, hsla(265, 75%, 26%, 1) 0%, hsla(365, 75%, 26%, 1) 100%);
  border-radius: 0px 0px 10px 10px;
  padding: 20px;
  
}

.navbar-img {
  margin-right: 5px;
  color: #DBDFEA;
}
</style>
