<template>
  <div class="container text-center">

    <h1 class="mt-5">Get yourself a {{tld}} domain!</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          {{tld}} domain is the official domain of 
          <a href="https://thewildbunch.io/" target="_blank">The Wild Bunch NFT community</a>, 
          and is powered by the Punk Domains protocol.
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

    <p class="error" v-if="buyNotValidFlexi(chosenDomainName).invalid">
      <small>
        <em>{{ buyNotValidFlexi(chosenDomainName).message }}</em>
      </small>
    </p>

    <p class="mt-4">
      Domain price: {{domainPrice}} ETH
    </p>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValidFlexi(chosenDomainName).invalid || paused || !canMint">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="!paused && canMint">Buy domain</span>
      <span v-if="!paused && !canMint">No TWB NFT</span>
      <span v-if="paused">Buying disabled</span>
    </button>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork(networkName)">Switch to {{networkName}}</button>
    </div>

  </div>

  <Referral v-if="isActivated" :urlpath="'partners/wildbunch'" />
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
import MinterAbi from "../../abi/partners/wildbunch/WildBunchMinter.json";
import tldAbi from '../../abi/FlexiPunkTLD.json';

export default {
  name: "WildBunch",

  data() {
    return {
      canMint: false,
      chosenDomainName: null,
      domainPrice: null,
      idMainnet: 1,
      idTestnet: 421611,
      loading: false, // loading data
      mintAddressTestnet: "0x6b5E4D2Bc94F356B3557AaEc35422d21FdcA66c9",
      mintAddressMainnet: "0xA8221890768603210c1a32d88374111084E46E6d",
      mintContract: null,
      nftAddressTestnet: "0x247934a3Cd3293AB0B334F0c5571B6fF05d1Dc11",
      nftAddressMainnet: "0xe9A1a323b4c8FD5Ce6842edaa0cd8af943cBdf22",
      nftContract: null,
      networkName: "Ethereum",
      paused: true,
      tld: ".wildbunch",
      tldAddressTestnet: "0xEEAEED736cc6A6e68CC2F62be19Cf7E06ad9E94A",
      tldAddressMainnet: "0xaa9E5Ade68C9C3Ea967Dc5dde731fd1f797152Cb",
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
        if (this.networkName.includes("Testnet") && this.chainId === this.idTestnet) {
          return true;
        } else if (!this.networkName.includes("Testnet") && this.chainId === this.idMainnet) {
          return true;
        }
      }

      return false;
    },
  },

  methods: {
    ...mapMutations("user", ["addDomainManually"]),

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + this.tld.toLowerCase();

      // check if domain is available
      const existingHolder = await this.tldContract.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      // set up minting contract
      let mintAddress = this.mintAddressMainnet;
      if (this.chainId === this.idTestnet) {
        mintAddress = this.mintAddressTestnet;
      }

      const mintIntfc = new ethers.utils.Interface(MinterAbi);
      this.mintContract = new ethers.Contract(mintAddress, mintIntfc, this.signer);

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        const tx = await this.mintContract.mint(
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
          this.toast("You have successfully bought a " + this.tld + " domain!", {
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

    changeNetwork(nName) {
      const networkData = this.switchNetwork(nName); 

      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    },

    async setContracts() {
      this.loading = true;

      // testnet data
      let fProvider = this.getFallbackProvider(this.idMainnet);
      let tldAddr = this.tldAddressMainnet;
      let mintAddr = this.mintAddressMainnet;
      let nftAddr = this.nftAddressMainnet;
      this.tld = ".wildbunch";

      // testnet data
      if (this.chainId === this.idTestnet) {
        fProvider = this.getFallbackProvider(this.idTestnet);
        tldAddr = this.tldAddressTestnet;
        mintAddr = this.mintAddressTestnet;
        nftAddr = this.nftAddressTestnet;
        this.tld = ".twbtest";
      }

      // TLD contract
      const tldIntfc = new ethers.utils.Interface(tldAbi); // note: interface must be defined as const, not as component data var!
      this.tldContract = new ethers.Contract(tldAddr, tldIntfc, fProvider);

      const priceWei = await this.tldContract.price();
      this.domainPrice = ethers.utils.formatEther(priceWei);

      if (this.address) {
        // NFT contract
        const nftIntfc = new ethers.utils.Interface([
          "function balanceOf(address) external view returns (uint256)"
        ]);
        this.nftContract = new ethers.Contract(nftAddr, nftIntfc, fProvider);

        const balance = await this.nftContract.balanceOf(this.address);
        if (balance > 0) {
          this.canMint = true;
        }
      }

      // minting contract
      const mintIntfc = new ethers.utils.Interface(MinterAbi);
      this.mintContract = new ethers.Contract(mintAddr, mintIntfc, fProvider);

      this.paused = await this.mintContract.paused();

      this.loading = false;
    }
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValidFlexi } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValidFlexi, chainId, isActivated, open, signer, switchNetwork, toast }
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