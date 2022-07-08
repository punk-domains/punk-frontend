<template>
  <div class="container text-center">

    <h1 class="mt-5">Get yourself a {{tld}} domain!</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          {{tld}} domain is the official domain of 
          <a href="https://discord.gg/W7MsheNg6r" target="_blank">the Huwa DAO community</a>, 
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
      Domain price: {{domainPrice}} {{payTokenName}}
    </p>

    <!-- Paused -->
    <button 
      v-if="isActivated && isNetworkSupported && paused" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      disabled="true"
    >
      <span>Buying disabled</span>
    </button>

    <!-- Balance too low -->
    <button 
      v-if="isActivated && isNetworkSupported && !paused && !hasUserEnoughTokens" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      disabled="true"
    >
      <span>Your {{payTokenName}} balance is too low</span>
    </button>

    <!-- Approve payment token -->
    <button 
      data-bs-toggle="modal" data-bs-target="#approveTokenModal"
      v-if="isActivated && isNetworkSupported && !paused && !hasEnoughAllowance && hasUserEnoughTokens" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      :disabled="waiting || buyNotValidFlexi(chosenDomainName).invalid"
    >
      <span>Approve {{payTokenName}}</span>
    </button>

    <p v-if="isActivated && isNetworkSupported && !paused && !hasEnoughAllowance" class="mt-1">
      <small><strong>Important:</strong> You will need to complete 2 transactions: Approve {{payTokenName}} + Buy Domain.</small>
    </p>

    <!-- Buy domain -->
    <button 
      v-if="isActivated && !paused && isNetworkSupported && hasUserEnoughTokens && hasEnoughAllowance" 
      class="btn btn-primary btn-lg mt-3 buy-button" 
      @click="buyDomain" 
      :disabled="waiting || buyNotValidFlexi(chosenDomainName).invalid || paused || !canMint"
    >
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="!paused && canMint">Buy domain</span>
      <span v-if="!paused && !canMint">Not eligible</span>
    </button>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork(networkName)">Switch to {{networkName}}</button>
    </div>

  </div>

  <Referral v-if="isActivated" :urlpath="'partners/huwa'" />

  <!-- Approve payment token modal -->
  <div class="modal fade" id="approveTokenModal" tabindex="-1" aria-labelledby="approveTokenModalLabel" aria-hidden="true" modal-dialog-centered>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="approveTokenModalLabel">Approve {{payTokenName}}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <p>
              If you plan to mint multiple domains, consider giving the minting contract a higher {{payTokenName}} approval.
            </p>
            <p>
              With each domain buy, the total approval amount is reduced by {{domainPrice}} {{payTokenName}}.
            </p>

            Approval for <input type="text" id="recipient-name" v-model="chosenAllowance"> {{payTokenName}}.
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            @click="approveTokens" 
            class="btn btn-secondary"
            :disabled="selectedAllowanceTooLow" 
            >
              <span v-if="!selectedAllowanceTooLow">Approve {{payTokenName}}</span>
              <span v-if="selectedAllowanceTooLow">Approval lower than domain price</span>
            </button>

          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
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
import MinterAbi from "../../abi/partners/huwa/HuwaMinter.json";
import tldAbi from '../../abi/FlexiPunkTLD.json';
import Erc20Abi from '../../abi/Erc20.json';

export default {
  name: "Huwa",

  data() {
    return {
      canMint: true,
      chosenAllowance: 20,
      chosenDomainName: null,
      domainPrice: null,
      idMainnet: 56,
      idTestnet: 421611,
      loading: false, // loading data
      mintAddressTestnet: "0xe3116Fe0b4526290c4231A59D2094605E581d8B6",
      mintAddressMainnet: "0xA8221890768603210c1a32d88374111084E46E6d",
      mintContract: null,
      networkName: "BNB Smart Chain", 
      paused: true,
      payTokenAddressTestnet: "0xD1d656845AD2a15934C314e46977554FFe85383E",
      payTokenAddressMainnet: "0x03a2A7E95eCe3112b8d33F9bCC21F0c9BA843e35",
      payTokenAllowance: 0,
      payTokenBalance: 0,
      payTokenContract: null,
      payTokenDecimals: 4,
      payTokenName: "HUWA",
      tld: ".huwa",
      tldAddressTestnet: "0x49651e70df13b8fd5684B0b82b1b3D7Cdc8cF80f",
      tldAddressMainnet: "0xeFBE0b46649B7A0F1e1D49CCa98aD9CF6bcFB096",
      tldContract: null,
      tldMainnet: ".huwa",
      tldTestnet: ".testhuwa",
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

    hasEnoughAllowance() {
      if (this.address && Number(this.payTokenBalance) > 0) {
        if (Number(this.payTokenAllowance) >= Number(this.domainPrice)) {
          return true;
        }
      }
      return false;
    },
    hasUserEnoughTokens() {
      if (this.address && Number(this.payTokenBalance) > 0) {
        if (Number(this.payTokenBalance) >= Number(this.domainPrice)) {
          return true;
        }
      }
      return false;
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

    selectedAllowanceTooLow() {
      if (Number(this.chosenAllowance) >= Number(this.domainPrice)) {
        return false;
      }
      return true;
    },
  },

  methods: {
    ...mapMutations("user", ["addDomainManually"]),

    async approveTokens() {
      this.waiting = true;

      let mintAddr;
      
      // match data to the chain ID
      if (this.chainId === this.idMainnet) {
        mintAddr = this.mintAddressMainnet;
      } else if (this.chainId === this.idTestnet) {
        mintAddr = this.mintAddressTestnet;
      }
      
      try {
        const tx = await this.payTokenContract.approve(
          mintAddr, // spender (minting contract)
          ethers.utils.parseUnits(String(this.chosenAllowance), this.payTokenDecimals) // amount
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
        document.getElementById('approveTokenModal').click(); // close the modal
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully set the allowance! Now proceed with buying the domain.", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.payTokenAllowance = Number(this.chosenAllowance);
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
          referral
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

    async fetchPaymentTokenData() {
      this.loading = true;

      if (this.address) {
        let payTokenAddr;
        let mintAddr;
      
        // match data to the chain ID
        if (this.chainId === this.idMainnet) {
          payTokenAddr = this.payTokenAddressMainnet;
          mintAddr = this.mintAddressMainnet;
        } else if (this.chainId === this.idTestnet) {
          payTokenAddr = this.payTokenAddressTestnet;
          mintAddr = this.mintAddressTestnet;
        }

        if (payTokenAddr) {
          // pay token contract
          const tokenIntfc = new ethers.utils.Interface(Erc20Abi);
          this.payTokenContract = new ethers.Contract(payTokenAddr, tokenIntfc, this.signer);

          const allowanceWei = await this.payTokenContract.allowance(this.address, mintAddr);
          this.payTokenAllowance = ethers.utils.formatUnits(allowanceWei, this.payTokenDecimals);
          console.log("payTokenAllowance: " + this.payTokenAllowance);

          const balanceWei = await this.payTokenContract.balanceOf(this.address);
          this.payTokenBalance = ethers.utils.formatUnits(balanceWei, this.payTokenDecimals);
          console.log("payTokenBalance: " + this.payTokenBalance);
        }
        
      }

      this.loading = false;
    },

    async setContracts() {
        this.loading = true;

        let fProvider;
        let tldAddr;
        let mintAddr;
        let nftAddr;
        let payTokenAddr;

        // testnet data
        if (this.networkName.includes("Testnet")) {
          fProvider = this.getFallbackProvider(this.idTestnet);
          tldAddr = this.tldAddressTestnet;
          mintAddr = this.mintAddressTestnet;
          nftAddr = this.nftAddressTestnet;
          payTokenAddr = this.payTokenAddressTestnet;
          this.tld = this.tldTestnet;
        } else {
          fProvider = this.getFallbackProvider(this.idMainnet);
          tldAddr = this.tldAddressMainnet;
          mintAddr = this.mintAddressMainnet;
          nftAddr = this.nftAddressMainnet;
          payTokenAddr = this.payTokenAddressMainnet;
          this.tld = this.tldMainnet;
        }
        
        // match data to the chain ID
        if (this.chainId === this.idMainnet) {
          fProvider = this.getFallbackProvider(this.idMainnet);
          tldAddr = this.tldAddressMainnet;
          mintAddr = this.mintAddressMainnet;
          nftAddr = this.nftAddressMainnet;
          payTokenAddr = this.payTokenAddressMainnet;
          this.tld = this.tldMainnet;
        } else if (this.chainId === this.idTestnet) {
          fProvider = this.getFallbackProvider(this.idTestnet);
          tldAddr = this.tldAddressTestnet;
          mintAddr = this.mintAddressTestnet;
          nftAddr = this.nftAddressTestnet;
          payTokenAddr = this.payTokenAddressTestnet;
          this.tld = this.tldTestnet;
        }

        // tld contract
        const tldIntfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(tldAddr, tldIntfc, fProvider);

        // minting contract
        const mintIntfc = new ethers.utils.Interface(MinterAbi);
        this.mintContract = new ethers.Contract(mintAddr, mintIntfc, fProvider);

        const priceWei = await this.mintContract.price();
        this.domainPrice = ethers.utils.formatUnits(priceWei, this.payTokenDecimals);

        this.paused = await this.mintContract.paused();

        this.loading = false;

        if (this.address) {
          this.fetchPaymentTokenData();
        }
    },
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
      this.fetchPaymentTokenData();
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