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

    <button class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid(chosenDomainName) || !canBuy">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="canBuy">Buy domain</span>
      <span v-if="!canBuy">Buying disabled</span>
    </button>
  </div>

  <div class="container text-center mt-3" v-if="tldOwner == address">
    <h2 class="mt-1">Start/stop domain sale (only owner)</h2>

    <p class="mt-5">
      TLD owner can start/stop public domain sale. If the sale is stopped, only owner can mint new domains 
      (for free, see section below).
    </p>

    <p class="mt-3" v-if="canBuy">Status: public sale is ENABLED.</p>
    <p class="mt-3" v-if="!canBuy">Status: public sale is DISABLED.</p>

    <button 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      @click="togglePublicSale" 
      :disabled="waitingSale"
    >
      <span v-if="waitingSale" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="canBuy">Stop the public sale</span>
      <span v-if="!canBuy">Enable the public sale</span>
    </button>

  </div>

  <div class="container text-center mt-3" v-if="tldOwner == address">
    <h2 class="mt-1">Mint domain for a specific address</h2>

    <p class="mt-5">Choose domain and the address that will own that domain:</p>

    <div class="d-flex justify-content-center">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="chosenDomainNameFree" 
          placeholder="enter domain name"
          type="text" 
          class="form-control text-end" 
          aria-label="Text input with dropdown button"
        >

        <span class="input-group-text tld-addon">.{{tld}}</span>
      </div>
    </div>

    <div class="d-flex justify-content-center">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="freeDomainReceiver" 
          placeholder="enter recipient address"
          type="text" 
          class="form-control text-center" 
          aria-label="Text input with dropdown button"
        >
      </div>
    </div>

    <button class="btn btn-primary btn-lg mt-3 buy-button" @click="ownerMintDomain" :disabled="waitingFree || buyNotValid(chosenDomainNameFree)">
      <span v-if="waitingFree" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Mint domain for address
    </button>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { displayEther, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import useDomainHelpers from "../hooks/useDomainHelpers";

export default {
  name: "TldDetails",
  props: ["tldChain", "tld"],

  data() {
    return {
      canBuy: false,
      chosenDomainName: null,
      chosenDomainNameFree: null,
      freeDomainReceiver: null,
      selectedPrice: null,
      tldContract: null,
      tldOwner: null,
      waiting: false, // waiting for TX to complete
      waitingFree: false, // waiting for owner's TX to complete
      waitingSale: false // waiting for start/stop sale tx to complete
    }
  },

  created() {
    if (this.isActivated) {
      this.fetchData();
    }
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getNetworkCurrency"]),
    ...mapGetters("punk", ["getTldAddresses", "getTldAddressesKey", "getDomainPrices", "getTldAbi"]),

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    domainLowerCaseFree() {
      return this.chosenDomainNameFree.toLowerCase();
    }
  },

  methods: {
    ...mapActions("punk", ["fetchTlds"]),
    ...mapMutations("user", ["addDomainManually"]),

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + "." + this.tld;

      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        const existingHolder = await this.tldContract.getDomainHolder(this.domainLowerCase);

        if (existingHolder !== ethers.constants.AddressZero) {
          this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
          this.waiting = false;
          return;
        }
      }

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        const tx = await this.tldContract.mint(
          this.domainLowerCase,
          this.address,
          referral,
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

        this.tldOwner = await this.tldContract.owner();
      }
    },

    async ownerMintDomain() {
      this.waitingFree = true;
      const fullDomainName = this.domainLowerCaseFree + "." + this.tld;
      const recipient = this.freeDomainReceiver;

      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        const existingHolder = await this.tldContract.getDomainHolder(this.domainLowerCaseFree);

        if (existingHolder !== ethers.constants.AddressZero) {
          this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
          this.waitingFree = false;
          return;
        }
      }

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        const tx = await this.tldContract.mint(
          this.domainLowerCaseFree,
          recipient,
          referral,
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

          if (String(recipient).toLowerCase() === String(this.address).toLowerCase()) {
            // if recipient is current user, add domain to the list of their domains
            this.addDomainManually(fullDomainName);
          }
          
          this.waitingFree = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingFree = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingFree = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingFree = false;
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
        const intfc = new ethers.utils.Interface(this.getTldAbi);
        this.tldContract = new ethers.Contract(tldAddr, intfc, this.signer);
      }
    },

    async togglePublicSale() {
      this.waitingSale = true;

      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        try {
          const tx = await this.tldContract.toggleBuyingDomains();

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
            this.toast("You have successfully changed the buying domains status from " + this.canBuy + " to " + !this.canBuy + "!", {
              type: TYPE.SUCCESS,
              onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });

            this.canBuy = !this.canBuy;
            
            this.waitingSale = false;
          } else {
            this.toast.dismiss(toastWait);
            this.toast("Transaction has failed.", {
              type: TYPE.ERROR,
              onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
            });
            console.log(receipt);
            this.waitingSale = false;
          }

        } catch (e) {
          console.log(e)
          this.waitingSale = false;
          this.toast(e.message, {type: TYPE.ERROR});
        }

        this.waitingSale = false;
      }

      
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();

    return { address, buyNotValid, chainId, isActivated, displayEther, signer, toast }
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