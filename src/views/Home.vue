<template>
  <div class="container text-center">
    <h2 class="mt-5">Find your perfect Web3 domain!</h2>

    <div class="dropdown mt-5">
      Choose network: 

      <button class="mx-3 btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
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

    <div class="d-flex mt-5 justify-content-center">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="chosenDomainName" 
          placeholder="enter domain name"
          type="text" 
          class="form-control text-end" 
          aria-label="Text input with dropdown button"
        >
        
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{selectedTld}}
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li><span class="dropdown-item" v-for="tld in enabledBuyingTlds" @click="changeTld(tld)">{{tld}}</span></li>
        </ul>
      </div>
    </div>

    <p class="mt-3">
      Domain price: {{selectedPrice}} {{getNetworkCurrency}}
    </p>

    <button class="btn btn-primary btn-lg mt-1 mb-4" @click="buyDomain" :disabled="waiting || buyNotValid">
      <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Buy domain
    </button>

  </div>
  
</template>

<script lang="ts">
import { ethers } from 'ethers';
import tldAbi from "../abi/PunkTLD.json";
import { useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "Home",

  data() {
    return {
      chosenDomainName: null,
      enabledBuyingTlds: [],
      selectedTld: null,
      selectedPrice: null,
      waiting: false, // waiting for TX to complete
    }
  },

  created() {
    if (this.getDomainPrices) {
      this.checkEnabledBuying();
    }
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getNetworkName", "getNetworkCurrency", "getSupportedNetworks", "getSupportedNetworkNames"]),
    ...mapGetters("punk", ["getTlds", "getTldAddresses", "getDomainPrices"]),

    buyNotValid() {
      if (this.chosenDomainName === "") {
        return true;
      } else if (this.chosenDomainName === null) {
        return true;
      } else if (this.chosenDomainName.includes(".")) {
        return true;
      } else if (this.chosenDomainName.includes(" ")) {
        return true;
      } else if (this.chosenDomainName.includes("%")) {
        return true;
      } else if (this.chosenDomainName.includes("&")) {
        return true;
      } else if (this.chosenDomainName.includes("?")) {
        return true;
      } else if (this.chosenDomainName.includes("#")) {
        return true;
      } else if (this.chosenDomainName.includes("/")) {
        return true;
      }

      return false;
    },
  },

  methods: {
    ...mapActions("punk", ["fetchTlds"]),
    ...mapMutations("user", ["addDomainManually"]),

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.chosenDomainName + this.selectedTld;

      const intfc = new ethers.utils.Interface(tldAbi);
      const contract = new ethers.Contract(this.getTldAddresses[this.selectedTld], intfc, this.signer);

      try {

        const tx = await contract["mint(string,address)"](
          this.chosenDomainName,
          this.address,
          {
            value: ethers.utils.parseEther(this.selectedPrice)
          }
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully bought the domain!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchTlds();
          this.addDomainManually(fullDomainName);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waiting = false;
        }

      } catch (e) {
        console.log(e)
        this.waiting = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waiting = false;
    },

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
      }

      window.ethereum.request({ 
        method: method, 
        params: params
      });
    },

    changeTld(tldName) {
      this.selectedTld = tldName;
      this.selectedPrice = this.getDomainPrices[tldName];
    },

    async checkEnabledBuying() {
      this.enabledBuyingTlds = [];
      
      if (this.getTlds) {
        for (let tld of this.getTlds) {
          // construct contract
          const intfc = new ethers.utils.Interface(tldAbi);
          const tldContract = new ethers.Contract(this.getTldAddresses[tld], intfc, this.signer);

          const canBuy = await tldContract.buyingEnabled();

          if (canBuy) {
            this.enabledBuyingTlds.push(tld);
          }
        }
      }

      this.selectedTld = this.enabledBuyingTlds[0];
      this.selectedPrice = this.getDomainPrices[this.selectedTld];
    }
  },

  setup() {
    const { address, signer } = useEthers()
    const toast = useToast();

    return { address, signer, toast }
  },

  watch: {
    getTlds() {
      if (this.getDomainPrices) {
        this.checkEnabledBuying();
      }
    },

    getDomainPrices(newVal, oldVal) {
      if (newVal) {
        this.checkEnabledBuying();
      }
    }
  }
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
