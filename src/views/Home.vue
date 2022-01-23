<template>
  <div class="container text-center">
    <h2>Find your perfect Web3 domain!</h2>

    <div class="dropdown mt-5">
      Choose network: 

      <button class="mx-3 btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
        {{getNetworkName}}
      </button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
        <li>
          <span 
            class="dropdown-item" 
            v-for="network in getSupportedNetworks"
            @click="changeNetwork(network)"
          >{{network}}</span>
        </li>
      </ul>
    </div>

    <div class="d-flex mt-5 justify-content-center">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input type="text" class="form-control text-end" aria-label="Text input with dropdown button">
        
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{getTlds[0]}}
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li><span class="dropdown-item" v-for="tld in getTlds">{{tld}}</span></li>
        </ul>
      </div>
    </div>

    <p>{{getTldAddresses}}</p>

  </div>
  
</template>

<script lang="ts">
import { mapGetters } from 'vuex';

export default {
  name: "Home",

  computed: {
    ...mapGetters("network", ["getNetworkName", "getSupportedNetworks"]),
    ...mapGetters("web3panda", ["getTlds", "getTldAddresses"]),
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
      }

      window.ethereum.request({ 
        method: method, 
        params: params
      });
    }
  },
}
</script>

<style scoped>
.domain-input {
  width: 50%;
}

.dropdown-item {
  cursor: pointer;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }
}
</style>
