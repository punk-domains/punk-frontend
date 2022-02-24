<template>
  <div class="container text-center">
    <h1 class="mt-5">Get a .{{tld}} domain!</h1>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="chosenDomainName" 
          placeholder="enter domain name"
          type="text" 
          class="form-control text-end" 
          aria-label="Text input with dropdown button"
        >

        <span class="input-group-text tld-addon">.{{tld}}</span>
      </div>
    </div>

    <p class="mt-4">
      Domain price: {{this.parseValue(this.selectedPrice)}} {{getNetworkCurrency}}
    </p>

    <button class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid || !canBuy">
      <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Buy domain
    </button>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import tldAbi from "../abi/PunkTLD.json";
import { displayEther, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "TldDetails",
  props: ["tldChain", "tld"],

  data() {
    return {
      canBuy: false,
      chosenDomainName: null,
      selectedPrice: null,
      tldContract: null,
      waiting: false, // waiting for TX to complete
    }
  },

  created() {
    if (this.isActivated) {
      this.fetchData();
    }
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getNetworkCurrency"]),
    ...mapGetters("punk", ["getTldAddresses", "getTldAddressesKey", "getDomainPrices"]),

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
      const fullDomainName = this.chosenDomainName + "." + this.tld;

      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        const existingHolder = await this.tldContract.getDomainHolder(this.chosenDomainName);

        if (existingHolder !== ethers.constants.AddressZero) {
          this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
          this.waiting = false;
          return;
        }
      }

      try {

        const tx = await this.tldContract["mint(string,address)"](
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

    async fetchData() {
      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        this.canBuy = await this.tldContract.buyingEnabled();
        this.selectedPrice = this.getDomainPrices["."+this.tld];
      }
    },

    parseValue(someVal) {
      if (someVal) {
        return ethers.utils.formatEther(someVal);
      }
    },

    setContract() {
      let tldAddresses = this.getTldAddresses;

      if (!tldAddresses) {
        const tldAddressesStorage = localStorage.getItem(this.getTldAddressesKey);

        if (tldAddressesStorage) {
          tldAddresses = JSON.parse(tldAddressesStorage);
        }
      }

      if (tldAddresses && JSON.stringify(tldAddresses) != "{}") {
        const tldAddr = tldAddresses["."+this.tld];

        // construct contract
        const intfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(tldAddr, intfc, this.signer);
      }
    }
  },

  setup() {
    const { address, isActivated, signer } = useEthers()
    const toast = useToast();

    return { address, isActivated, displayEther, signer, toast }
  },

  watch: {
    isActivated() {
      this.fetchData();
    },

    getDomainPrices(newVal, oldVal) {
      if (newVal) {
        this.fetchData();
      }
    },

    tld() {
      if (this.isActivated) {
        this.setContract();
        this.fetchData();
      }
    },
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

.tld-addon {
  background-color: white;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }
}
</style>