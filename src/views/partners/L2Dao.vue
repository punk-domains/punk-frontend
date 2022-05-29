<template>
  <div class="container text-center">
    <img class="img-fluid l2dao" src="../../assets/partners/l2dao.png" />
    <span class="and">&amp;</span>
    <img class="img-fluid l2dao" src="../../assets/logo.png" />

    <h1 class="mt-5">Get yourself a .L2 Domain!</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          .L2 domain is the official domain of Layer2DAO and powered by the Punk Domains protocol.
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

        <span class="input-group-text tld-addon">
          <span v-if="loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span v-if="!loading">{{tld}}</span>
        </span>
      </div>
    </div>

    <p class="error" v-if="buyNotValid(chosenDomainName).invalid">
      <small>
        <em>{{ buyNotValid(chosenDomainName).message }}</em>
      </small>
    </p>

    <p class="mt-4">
      Domain price: {{domainPrice}} ETH
    </p>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid(chosenDomainName).invalid || paused">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="!paused">Buy domain</span>
      <span v-if="paused">Buying disabled</span>
    </button>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork('Optimism')">Switch to Optimism</button>
    </div>

  </div>

  <Referral v-if="isActivated" />
</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import Referral from '../../components/Referral.vue';
import useDomainHelpers from "../../hooks/useDomainHelpers";
import useChainHelpers from "../../hooks/useChainHelpers";
import L2DaoPunkDomainsAbi from "../../abi/partners/l2dao/L2DaoPunkDomains.json";
import tldAbi from '../../abi/PunkTLD.json';

export default {
  name: "L2Dao",

  data() {
    return {
      chosenDomainName: null,
      domainPrice: null,
      loading: false, // loading data
      mintContract: null,
      paused: true,
      tld: ".L2",
      tldContract: null,
      waiting: false, // waiting for TX to complete
    }
  },

  components: {
    Referral
  },

  created() {
    this.setContracts();
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getFallbackProvider"]),

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
      const fullDomainName = this.domainLowerCase + this.tld.toLowerCase();

      // mint contract
      let tldAddr = "0x9A7657d1593032C75d70950707870c3cC7ca45DC"; // on Optimism Mainnet

      if (this.chainId === 69) {
        tldAddr = "0xB5B8AF8199777d471c0320BC11022433df6D100e"; // on Optimism Testnet
      }

      const tldIntfc = new ethers.utils.Interface(tldAbi);
      const tldContract2 = new ethers.Contract(tldAddr, tldIntfc, this.signer);

      const existingHolder = await tldContract2.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        const tx = await tldContract2.mint(
          this.domainLowerCase,
          this.address,
          referral,
          {
            value: ethers.utils.parseEther(this.domainPrice)
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
          this.setContracts();
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

    async setContracts() {
      this.loading = true;

      let fProvider = this.getFallbackProvider(10);
      let tldAddr = "0x9A7657d1593032C75d70950707870c3cC7ca45DC"; // .L2
      this.tld = ".L2";
      
      if (this.chainId === 69) { // Optimism Testnet
        fProvider = this.getFallbackProvider(69);
        tldAddr = "0xB5B8AF8199777d471c0320BC11022433df6D100e"; // .L2TEST
        this.tld = ".L2test";
      }

      // TLD contract
      const tldIntfc = new ethers.utils.Interface(tldAbi);
      this.tldContract = new ethers.Contract(tldAddr, tldIntfc, fProvider);

      const priceWei = await this.tldContract.price();
      this.domainPrice = ethers.utils.formatEther(priceWei);

      const buyingEnabled = await this.tldContract.buyingEnabled();
      this.paused = !buyingEnabled;

      this.loading = false;
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
    address() {
      this.setContracts();
    },

    chainId() {
      this.setContracts();
    },
  }
}
</script>

<style scoped>
.and {
  font-size: 1.7em;
  vertical-align: bottom;
  padding-left: 0.2em;
  padding-right: 0.1em;
}

.buy-button {
  margin-bottom: 50px;
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

.l2dao {
  width: 50px;
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