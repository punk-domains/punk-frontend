<template>
  <div class="container text-center">

    <h1 class="mt-5">.polygon Domain Refund</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          In order to avoid domain collisions, Punk Domains .polygon TLD is shutting down. Each .polygon domain holder 
          will receive 14 MATIC and $2000 in credits from Unstoppable Domains.
        </p>

        <p>
          Claim these benefits by sending your .polygon domain(s) to the burn contract using the form below. The 
          refund of 14 MATIC will automatically be sent to you for each burned domain.
        </p>

        <p>
          After claiming this refund, submit 
          <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdAR7BND4o7axj0PsFfDQyFyd2EItKKnjJek3kqCYnUe9naBA/viewform">the Google Form here</a> 
          to claim $2000 in UD credits.
        </p>
      </div>
    </div>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="domains" 
          placeholder="enter domains (separate multiple domains with a comma)"
          type="text" 
          class="form-control text-center" 
        >
      </div>
    </div>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="approveOrBurnDomains" :disabled="waiting || paused || !canClaim">
      <span v-if="waiting || loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="!paused && !loading && canClaim && approved">Burn and claim refund</span>
      <span v-if="!paused && !loading && canClaim && !approved">Approve domains</span>
      <span v-if="paused">Paused</span>
      <span v-if="!paused && !canClaim">Not eligible</span>
    </button>

    <div v-if="!paused && !loading && canClaim && !approved" class="mb-2">
      You will need to do two transactions: Approve + Claim
    </div>

    <div v-if="!isActivated" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="open">Connect wallet</button>
    </div>

    <div v-if="isActivated && !isNetworkSupported" class="mt-4 buy-button">
      <button class="btn btn-primary btn-lg" @click="changeNetwork('Polygon')">Switch to Polygon</button>
    </div>

  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapActions, mapGetters } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import useChainHelpers from "../../hooks/useChainHelpers";
import tldAbi from '../../abi/PunkTLD.json';
import UDPolygonRefund from '../../abi/partners/unstoppable/UDPolygonRefund.json';

export default {
  name: "UnstoppablePolygonRefund",

  data() {
    return {
      approved: false,
      canClaim: false,
      domains: null,
      domainPrice: null,
      loading: false, // loading data
      paused: true,
      refundAddress: null,
      tld: ".polygon",
      refundContract: null,
      tldAddress: null,
      waiting: false, // waiting for TX to complete
    }
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
        if (this.chainId === 137 || this.chainId === 80001) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapActions("user", ["removeDomainFromUserDomains"]),

    approveOrBurnDomains() {
      if (!this.approved) {
        this.approveDomains();
      } else {
        this.burnDomains();
      }
    },

    async approveDomains() {
      this.waiting = true;

      const intfc = new ethers.utils.Interface(tldAbi);
      const tldContractSigner = new ethers.Contract(this.tldAddress, intfc, this.signer);

      try {
        const tx = await tldContractSigner.setApprovalForAll(this.refundAddress, true);

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
          this.toast("You have successfully approved domains! Now proceed with the Burn & Claim step.", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.approved = true;
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

    async burnDomains() {
      this.waiting = true;

      // remove all whitespace
      const domainsNoSpaces = this.domains.replace(/ /g,'');

      // make string lowercase & replace all .polygon extensions (only domain names need to be sent)
      const domainsNoExtension = domainsNoSpaces.toLowerCase().replaceAll(this.tld, "");

      // split by comma
      const domainsList = domainsNoExtension.split(",");
      console.log(domainsList);

      const intfc = new ethers.utils.Interface(UDPolygonRefund);
      const refundContractSigner = new ethers.Contract(this.refundAddress, intfc, this.signer);

      try {
        const tx = await refundContractSigner.claimRefundBulk(domainsList);

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
          this.toast("You have successfully claimed the refund!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          for (let domainName of domainsList) {
            this.removeDomainFromUserDomains(domainName+this.tld);
          }
          
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

      let fProvider;
      
      if (this.chainId === 137) { // Polygon Mainnet
        fProvider = this.getFallbackProvider(137);
        this.tld = ".polygon";
        this.tldAddress = "0xBca24d86e4Ad1e011278FaEFc4fF191a731411EC"; // .polygon
        this.refundAddress = "";
      } else if (this.chainId === 80001) { // Polygon Testnet (Mumbai)
        fProvider = this.getFallbackProvider(80001);
        this.tld = ".polygontest";
        this.tldAddress = "0xDEF098948F47F9Fbe80fF2D966c27965DFB47F26"; // .polygontest
        this.refundAddress = "0x1d28fFd63979165c779D80f319457250545217dA";
      }

      if (fProvider) {
        const intfc = new ethers.utils.Interface(UDPolygonRefund);
        this.refundContract = new ethers.Contract(this.refundAddress, intfc, fProvider);

        const isPaused = await this.refundContract.paused();
        this.paused = isPaused;
      }

      if (this.address) {
        const canClaimRefund = await this.refundContract.canClaimRefund(this.address);
        this.canClaim = canClaimRefund;

        const tldIntfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(this.tldAddress, tldIntfc, fProvider);

        const isApproved = await this.tldContract.isApprovedForAll(this.address, this.refundAddress);
        this.approved = isApproved;
      }

      this.loading = false;
    },
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { switchNetwork } = useChainHelpers();

    return { address, chainId, isActivated, open, signer, switchNetwork, toast }
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