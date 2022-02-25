<template>
  <div class="container text-center">
    <h1 class="mt-5">Permissionless Web3 Domains</h1>

    <div v-if="isActivated" class="dropdown mt-5">
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

    <div v-if="!isActivated" class="mt-5">
      <button class="btn btn-primary" @click="open">Connect wallet</button>
    </div>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="chosenDomainName" 
          placeholder="enter domain name"
          type="text" 
          class="form-control text-end" 
          aria-label="Text input with dropdown button"
        >
        
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <span v-if="isActivated && !selectedTld" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{selectedTld}}
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li><span class="dropdown-item" v-for="tld in enabledBuyingTlds" @click="changeTld(tld)">{{tld}}</span></li>
        </ul>
      </div>
    </div>

    <p class="mt-3">
      Domain price: {{this.parseValue(this.selectedPrice)}} {{getNetworkCurrency}}
    </p>

    <button class="btn btn-primary btn-lg mt-1 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid">
      <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Buy domain
    </button>

  </div>
  
</template>

<script lang="ts">
import { ethers } from 'ethers';
import tldAbi from "../abi/PunkTLD.json";
import { displayEther, useBoard, useEthers } from 'vue-dapp';
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

      const existingHolder = await contract.getDomainHolder(this.chosenDomainName);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      try {

        const tx = await contract["mint(string,address)"](
          this.chosenDomainName,
          this.address,
          {
            value: String(this.selectedPrice)
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
          blockExplorerUrls: [ "https://testnet.arbiscan.io" ],
          chainId: "0x66EEB",
          chainName: "Arbitrum Testnet",
          nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
          rpcUrls: ["https://rinkeby.arbitrum.io/rpc"]
        }] 
      } else if (networkName == "Optimism") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://optimistic.etherscan.io/" ],
          chainId: "0xA",
          chainName: "Optimism",
          nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" }, 
          rpcUrls: ["https://mainnet.optimism.io"]
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
      } else if (networkName == "Polygon") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://polygonscan.com" ],
          chainId: "0x89",
          chainName: "Polygon PoS Chain",
          nativeCurrency: { decimals: 18, name: "MATIC", symbol: "MATIC" }, 
          rpcUrls: ["https://polygon-rpc.com/"]
        }] 
      } else if (networkName == "Gnosis Testnet") {
        method = "wallet_addEthereumChain"
        params = [{ 
          blockExplorerUrls: [ "https://blockscout.com/poa/sokol" ],
          chainId: "0x4D",
          chainName: "Gnosis Testnet",
          nativeCurrency: { decimals: 18, name: "SPOA", symbol: "SPOA" }, 
          rpcUrls: ["https://sokol.poa.network"]
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

      let counter = 0;

      if (this.getTlds) {
        for (let tld of this.getTlds) {
          // construct contract
          const intfc = new ethers.utils.Interface(tldAbi);
          const tldContract = new ethers.Contract(this.getTldAddresses[tld], intfc, this.signer);

          const canBuy = await tldContract.buyingEnabled();

          if (canBuy) {
            this.enabledBuyingTlds.push(tld);

            if (counter === 0) {
              this.selectedTld = tld;
              counter++;
            }
          }
        }
      }

      if (this.enabledBuyingTlds) {
        this.selectedTld = this.enabledBuyingTlds[0];
      }

      this.selectedPrice = this.getDomainPrices[this.selectedTld];
    },

    parseValue(someVal) {
      if (someVal) {
        return ethers.utils.formatEther(someVal);
      }
    }
  },

  setup() {
    const { open } = useBoard()
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast();

    return { address, chainId, isActivated, displayEther, open, signer, toast }
  },

  watch: {
    chainId(newVal, oldVal) {
      if (newVal != oldVal) {
        this.selectedTld = null;
      }
    },

    getTlds(newVal, oldVal) {
      if (newVal && this.getDomainPrices) {
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
.buy-button {
  margin-bottom: 100px;
}

.domain-input {
  width: 50%;
}

.domain-input-container {
  margin-top: 80px;
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
