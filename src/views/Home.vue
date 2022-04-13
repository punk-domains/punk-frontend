<template>
  <div class="container text-center">
    <h1 class="mt-5">Mint Your .klima Domain!</h1>

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
          <span>.klima</span>
        </span>
      </div>
    </div>

    <p class="error">
      <small v-if="buyNotValid(chosenDomainName).invalid">
        <em>{{ buyNotValid(chosenDomainName).message }}</em>
      </small>
    </p>

    <p class="mt-3">
      Domain price: {{getWrapperTldPrice}} USDC
    </p>

    <!-- Wrapper contract paused -->
    <button v-if="isActivated && getWrapperPaused" class="btn btn-primary btn-lg mt-3 buy-button" :disabled="true">
      <span v-if="getWrapperPaused">Buying paused</span>
    </button>

    <!-- Too low USDC balance -->
    <button v-if="isActivated && isNetworkSupported && !getWrapperPaused && !hasUserEnoughUsdc" class="btn btn-primary btn-lg mt-3 buy-button" @click="approveUsdc" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
      <span>Your USDC balance is too low</span>
    </button>

    <!-- Approve USDC -->
    <button data-bs-toggle="modal" data-bs-target="#approveUsdcModal" v-if="isActivated && isNetworkSupported && !getWrapperPaused && !hasEnoughUsdcAllowance && hasUserEnoughUsdc" class="btn btn-primary btn-lg mt-3 buy-button" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span>Approve USDC</span>
    </button>

    <p v-if="isActivated && isNetworkSupported && !getWrapperPaused && !hasEnoughUsdcAllowance && hasUserEnoughUsdc" class="mt-1">
      <small><strong>Important:</strong> You will need to complete 2 transactions: Approve USDC + Buy Domain.</small>
    </p>

    <!-- Buy domain -->
    <button v-if="isActivated && isNetworkSupported && !getWrapperPaused && hasEnoughUsdcAllowance && hasUserEnoughUsdc" class="btn btn-primary btn-lg mt-3 buy-button" @click="buyDomain" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
      <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span>Buy domain</span>
    </button>

    <!-- Connect Wallet -->
    <button v-if="!isActivated" class="btn btn-primary btn-lg mt-3 buy-button" @click="open">Connect wallet</button>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork('Polygon')">Switch to Polygon</button>
    </div>

    <p v-if="isActivated && isNetworkSupported" class="mt-5">
      <small>Your USDC balance: {{getUsdcBalance}} USDC</small> <br />
      <small>Your USDC allowance: {{getUsdcAllowance}} USDC</small>
    </p>
    
  </div>

  <Referral v-if="isActivated" />


  <!-- Approve USDC Modal -->
  <div class="modal fade" id="approveUsdcModal" tabindex="-1" aria-labelledby="approveUsdcModalLabel" aria-hidden="true" modal-dialog-centered>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="approveUsdcModalLabel">Approve USDC</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <p>
              If you plan to mint multiple domains, consider giving the minting contract a higher USDC approval. 
              With each domain buy, the total approval amount is reduced by {{getWrapperTldPrice}} USDC. (Worry not, 
              redundant approval amount can later be reduced to 0.)
            </p>

            Approval for <input type="text" id="recipient-name" v-model="chosenAllowance"> USDC.
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            @click="approveUsdc" 
            class="btn btn-secondary"
            :disabled="selectedAllowanceTooLow" 
            >
              <span v-if="!selectedAllowanceTooLow">Approve USDC</span>
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
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import Referral from '../components/Referral.vue';
import useDomainHelpers from "../hooks/useDomainHelpers";
import useChainHelpers from "../hooks/useChainHelpers";
import KlimaPunkDomainsAbi from "../abi/KlimaPunkDomains.json";
import tldAbi from '../abi/PunkTLD.json';
import erc20Abi from '../abi/Erc20.json';

export default {
  name: "Home",

  data() {
    return {
      chosenDomainName: null,
      chosenAllowance: null,
      loading: false, // loading data
      waiting: false, // waiting for TX to complete
      wrapperContract: null
    }
  },

  components: {
    Referral
  },

  created() {
    this.chosenAllowance = this.getWrapperTldPrice;
  },

  computed: {
    ...mapGetters("user", ["getUsdcAddress", "getUsdcAllowance", "getUsdcBalance"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),
    ...mapGetters("klima", ["getKlimaWrapperAddress", "getKlimaTldContract", "getWrapperTldPrice", "getWrapperPaused"]),

    selectedAllowanceTooLow() {
      if (Number(this.chosenAllowance) >= Number(this.getWrapperTldPrice)) {
        return false;
      }

      return true;
    },

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    hasEnoughUsdcAllowance() {
      if (this.address && Number(this.getWrapperTldPrice) > 0 && Number(this.getUsdcBalance) > 0) {
        if (Number(this.getUsdcAllowance) >= Number(this.getWrapperTldPrice)) {
          return true;
        }
      }

      return false;
    },

    hasUserEnoughUsdc() {
      if (this.address && Number(this.getWrapperTldPrice) > 0 && Number(this.getUsdcBalance) > 0) {
        if (Number(this.getUsdcBalance) >= Number(this.getWrapperTldPrice)) {
          return true;
        }
      }

      return false;
    },

    isNetworkSupported() {
      if (this.isActivated) {
        if (this.chainId === 137) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapMutations("user", ["addDomainManually", "setUsdcAllowance"]),

    async approveUsdc() {
      this.waiting = true;

      // USDC contract
      const usdcIntfc = new ethers.utils.Interface(erc20Abi);
      const usdcContractSigner = new ethers.Contract(this.getUsdcAddress, usdcIntfc, this.signer);

      try {
        const tx = await usdcContractSigner.approve(
          this.getKlimaWrapperAddress, // spender (wrapper contract)
          ethers.utils.parseUnits(this.chosenAllowance, "mwei") // amount (in mwei, 6 decimals)
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

        document.getElementById('approveUsdcModal').click(); // close the modal

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully set the allowance! Now proceed with buying the domain.", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.setUsdcAllowance(this.chosenAllowance);
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
      const fullDomainName = this.domainLowerCase + ".klima";

      // mint contract
      const wrapperIntfc = new ethers.utils.Interface(KlimaPunkDomainsAbi);
      const wrapperContractSigner = new ethers.Contract(this.getKlimaWrapperAddress, wrapperIntfc, this.signer);

      const existingHolder = await this.getKlimaTldContract.getDomainHolder(this.domainLowerCase);

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

        const tx = await wrapperContractSigner.mint(
          this.domainLowerCase,
          referral,
          {
            value: ethers.utils.parseEther(this.getWrapperTldPrice)
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
    }
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValid, chainId, isActivated, open, signer, switchNetwork, toast }
  }
}
</script>

<style scoped>
.domain-input {
  width: 50%;
}

.domain-input-container {
  margin-top: 80px;
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