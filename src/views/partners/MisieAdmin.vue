<template>
  <div class="container text-center">
    <h1 class="mt-5">Misie Admin</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          This is the admin page for the .misie domain.
        </p>
      </div>
    </div>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-1 domain-input input-group-lg">
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

    <div class="d-flex justify-content-center mt-2">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="receiverAddress" 
          placeholder="enter receiver address"
          type="text" 
          class="form-control text-center"
        >
      </div>
    </div>

    <p class="error" v-if="buyNotValidFlexi(chosenDomainName).invalid">
      <small>
        <em>{{ buyNotValidFlexi(chosenDomainName).message }}</em>
      </small>
    </p>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValidFlexi(chosenDomainName).invalid">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span>Mint domain</span>
    </button>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork('Arbitrum')">Switch to Arbitrum</button>
    </div>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import useDomainHelpers from "../../hooks/useDomainHelpers";
import useChainHelpers from "../../hooks/useChainHelpers";
import tldAbi from '../../abi/FlexiPunkTLD.json';

export default {
  name: "MisieAdmin",

  data() {
    return {
      chosenDomainName: null,
      receiverAddress: null,
      domainPrice: null,
      loading: false, // loading data
      tld: ".misie",
      tldContract: null,
      waiting: false, // waiting for TX to complete
    }
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getFallbackProvider"]),

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    isNetworkSupported() {
      if (this.isActivated) {
        if (this.chainId === 42161) {
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
      let tldAddr = "0x526Ff108F5d422d0e1d6650E2Bc015BBE1fdb058"; // on Arbitrum Mainnet

      const tldIntfc = new ethers.utils.Interface(tldAbi);
      const tldContract2 = new ethers.Contract(tldAddr, tldIntfc, this.signer);

      const existingHolder = await tldContract2.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      try {
        const tx = await tldContract2.mint(
          this.domainLowerCase,
          this.receiverAddress,
          ethers.constants.AddressZero,
          {
            value: ethers.utils.parseEther("0")
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
          this.toast("You have successfully minted the domain!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
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
    }
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValidFlexi } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValidFlexi, chainId, isActivated, open, signer, switchNetwork, toast }
  }
}
</script>

<style scoped>
.and {
  font-size: 1.7em;
  vertical-align: bottom;
  padding-left: 0.2em;
  padding-right: 0.2em;
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
  color: #fff;
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