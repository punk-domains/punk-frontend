<template>
  <div class="container text-center">
    <h1 class="mt-5">Exclusively For L2DAO Community!</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          Layer2DAO and Punk Domains have partnered up to offer L2DAO NFT holders the exclusive chance to mint .L2 
          domains before anyone else...
          <br />
          <small><em>(... and for a discounted price)</em></small>
        </p>
      </div>
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

        <span class="input-group-text tld-addon">.L2</span>
      </div>
    </div>

    <p class="error" v-if="buyNotValid(chosenDomainName).invalid">
      <small>
        <em>{{ buyNotValid(chosenDomainName).message }}</em>
      </small>
    </p>

    <p class="mt-4" v-if="!paused">
      Domain price: {{domainPrice}} ETH
    </p>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !canBuy || paused">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="canBuy && !paused">Buy domain</span>
      <span v-if="paused">Buying disabled</span>
      <span v-if="!canBuy && !paused">Not eligible</span>
    </button>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork('Optimism Testnet')">Switch to Optimism</button>
    </div>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import useDomainHelpers from "../../hooks/useDomainHelpers";
import useChainHelpers from "../../hooks/useChainHelpers";
import L2DaoPunkDomainsAbi from "../../abi/partners/l2dao/L2DaoPunkDomains.json";
import tldAbi from '../../abi/PunkTLD.json';

export default {
  name: "L2Dao",

  data() {
    return {
      paused: true,
      canBuy: false,
      chosenDomainName: null,
      domainPrice: null,
      tldContract: null,
      mintContract: null,
      waiting: false, // waiting for TX to complete
    }
  },

  created() {
    this.setContracts();
  },

  computed: {
    ...mapGetters("network", ["getFallbackProvider"]),

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    isNetworkSupported() {
      if (this.isActivated) {
        if (this.chainId === 10 || this.chainId === 69) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapMutations("user", ["addDomainManually"]),

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + ".l2"

      // connect contract with metamask signer
      this.mintContract = this.mintContract.connect(this.signer);

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

        const tx = await this.mintContract.mint(
          this.domainLowerCase,
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

    changeNetwork(networkName) {
      const networkData = this.switchNetwork(networkName); 

      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    },

    async checkNftHoldings() {
      if (!this.mintContract) {
        this.setContracts();
      }
      
      // check if user has L2DAO NFTs
      if (this.isActivated && this.mintContract) {
        this.canBuy = await this.mintContract.canUserMint(this.address);
      }
    },

    async setContracts() {
      let tldAddr = "";
      let mintAddr = "";
      let networkId = 10;

      if (this.chainId === 69) {
        networkId = 69; // Optimism Testnet
        tldAddr = "0xB5B8AF8199777d471c0320BC11022433df6D100e"; // .L2TEST
        mintAddr = "0x6b5E4D2Bc94F356B3557AaEc35422d21FdcA66c9";
      }

      const fProvider = this.getFallbackProvider(networkId);

      // TLD contract
      if (tldAddr && !this.paused) {
        const tldIntfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(tldAddr, tldIntfc, fProvider);

        const priceWei = await this.tldContract.price();
        this.domainPrice = ethers.utils.formatEther(priceWei);
      }

      // Mint contract
      if (mintAddr) {
        const mintIntfc = new ethers.utils.Interface(L2DaoPunkDomainsAbi);
        this.mintContract = new ethers.Contract(mintAddr, mintIntfc, fProvider);

        this.paused = await this.mintContract.paused();
      }
      
    },
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValid, chainId, isActivated, open, signer, switchNetwork, toast }
  },

  watch: {
    isActivated() {
      this.checkNftHoldings();
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
  margin-top: 30px;
}

.error {
  color: #DBDFEA;
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