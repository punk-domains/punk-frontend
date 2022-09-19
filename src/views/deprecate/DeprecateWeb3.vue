<template>
  <div class="container text-center">

    <h1 class="mt-5">.web3 Domain Refund</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          In order to avoid domain collisions, Punk Domains .web3 TLD is shutting down. All .web3 users can get a refund 
          in the form of two new .poly domains (and MATIC refund if they paid for their .web3 domain).
        </p>

        <p>
          Claim the refund by sending your .web3 domain to the burn contract using the form below. Also choose the new 
          .poly domains that you'd like to have minted. If you've paid for your .web3 domain, you'll also receive a MATIC refund.
        </p>
      </div>
    </div>

    <h3 class="mt-4">Domain to burn:</h3>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="domain" 
          placeholder="Enter the .web3 domain to burn"
          type="text" 
          class="form-control text-center" 
        >
      </div>
    </div>

    <h3 class="mt-4">Mint two new domains for free (<code>.poly</code>):</h3>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="newDomainOne" 
          placeholder="Enter new domain #1"
          type="text" 
          class="form-control text-center"
        >
        <button class="btn btn-outline-light" @click="checkDomainAvailability(newDomainOne)" type="button" id="button-addon2">Check availability</button>
      </div>
    </div>

    <div class="d-flex justify-content-center domain-input-container">
      <div class="input-group mb-3 domain-input input-group-lg">
        <input
          v-model="newDomainTwo" 
          placeholder="Enter new domain #2"
          type="text" 
          class="form-control text-center"
        >
        <button class="btn btn-outline-light" @click="checkDomainAvailability(newDomainTwo)" type="button" id="button-addon2">Check availability</button>
      </div>
    </div>

    <div class="d-flex justify-content-center alert alert-danger" v-if="contractBalance && contractBalance < 60">
      The refund contract balance is {{contractBalance}} MATIC. Please notify Punk Domains on Discord to refill the contract balance.
    </div>

    <button v-if="isActivated && isNetworkSupported" class="btn btn-primary btn-lg mt-3 buy-button" @click="approveOrBurnDomain" :disabled="waiting || paused || !canClaim">
      <span v-if="waiting || loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
      <span v-if="!paused && !loading && canClaim && approved">Claim refund</span>
      <span v-if="!paused && !loading && canClaim && !approved">Approve domain</span>
      <span v-if="paused">Paused</span>
      <span v-if="!paused && !canClaim">Not eligible</span>
    </button>

    <div v-if="!paused && !loading && canClaim && !approved" class="mb-2">
      You will need to do two transactions: Approve + Claim refund
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
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import useChainHelpers from "../../hooks/useChainHelpers";
import tldAbi from '../../abi/PunkTLD.json';
import DeprecateTld from '../../abi/DeprecateTld.json';

export default {
  name: "DeprecateWeb3",

  data() {
    return {
      approved: false,
      canClaim: false,
      contractBalance: null,
      domain: null,
      domainPrice: null,
      loading: false, // loading data
      newDomainOne: null,
      newDomainTwo: null,
      newTldAddress: null,
      paused: true,
      refundAddress: null,
      tld: ".web3",
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
        if (this.chainId === 137 || this.chainId === 77) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapActions("user", ["removeDomainFromUserDomains"]),
    ...mapMutations("user", ["addDomainManually"]),

    approveOrBurnDomain() {
      if (!this.approved) {
        this.approveDomain();
      } else {
        this.burnDomain();
      }
    },

    async approveDomain() {
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
          this.toast("You have successfully approved the domain for processing! Now proceed with the Burn & Claim step.", {
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

    async burnDomain() {
      this.waiting = true;

      // remove all whitespace
      const domainNoSpaces = this.domain.replace(/ /g,'');

      // make string lowercase & replace the .web3 extension (only domain name need to be sent)
      const domainNoExtension = domainNoSpaces.toLowerCase().replace(this.tld, "");

      const intfc = new ethers.utils.Interface(DeprecateTld);
      const refundContractSigner = new ethers.Contract(this.refundAddress, intfc, this.signer);

      // get new domain names and extensions
      const newDomainOneNoSpaces = this.newDomainOne.replace(/ /g,'').toLowerCase();
      const domArrOne = newDomainOneNoSpaces.split(".");
      const newDomainTwoNoSpaces = this.newDomainTwo.replace(/ /g,'').toLowerCase();
      const domArrTwo = newDomainTwoNoSpaces.split(".");

      const tldIntfc = new ethers.utils.Interface(tldAbi);
      const contract = new ethers.Contract(this.tldAddress, tldIntfc, this.fProvider);

      // check if user owns that .web3 domain
      const deprecatedDomainHolder = await contract.getDomainHolder(String(domainNoExtension).toLowerCase());

      if (deprecatedDomainHolder !== this.address) {
        this.toast("Your currently connected address does not own " + domainNoSpaces, {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      try {
        const tx = await refundContractSigner.refund(
          domainNoExtension, // old domain name
          domArrOne[0], // new domain 1 name
          "."+domArrOne[1], // new domain 1 TLD
          domArrTwo[0], // new domain 2 name
          "."+domArrTwo[1] // new domain 2 TLD
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
          this.toast("You have successfully claimed the refund!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });

          this.removeDomainFromUserDomains(domainNoSpaces.toLowerCase());
          this.addDomainManually(newDomainOneNoSpaces);
          this.addDomainManually(newDomainTwoNoSpaces);
          this.waiting = false;
          this.setContracts();
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

    async checkDomainAvailability(fullDomainName) {
      if (fullDomainName && fullDomainName.split(".").length === 2) {
        const domArr = fullDomainName.split(".");

        console.log(String(domArr[0]).toLowerCase());

        const tldIntfc = new ethers.utils.Interface(tldAbi);
        const contract = new ethers.Contract(this.newTldAddress, tldIntfc, this.fProvider);

        // check if domain is already taken
        const existingHolder = await contract.getDomainHolder(String(domArr[0]).toLowerCase());

        if (existingHolder !== ethers.constants.AddressZero) {
          this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        } else {
          this.toast("This domain is available. Nice!", {type: TYPE.SUCCESS});
        }
      } else {
        this.toast("Please enter a full domain name, for example: tempe.poly", {
          type: TYPE.ERROR
        });
      }
    },

    async setContracts() {
      this.loading = true;
      
      if (this.chainId === 137) { // Polygon Mainnet
        this.fProvider = this.getFallbackProvider(137);
        this.tld = ".web3";
        this.tldAddress = "0xb6Cf2874588d0fdFAf9d1b5E254ee6C49110C68B"; // .web3
        this.newTldAddress = "0x70Ac07C50131b7bb2c8Bd9466D8d2add30B7759f"; // .poly
        this.refundAddress = "0x6724c95Af33e396d85D2Fc93609C60D23490878B";
      } else if (this.chainId === 77) { // Gnosis Chain Testnet (Sokol)
        this.fProvider = this.getFallbackProvider(77);
        this.tld = ".gnosis";
        this.tldAddress = "0x0744d775804BB81efD3fF630402988b2F7eB284B"; // .gnosis
        this.newTldAddress = "0x110Cc3f64CdF8ffAdC785dFA53906bCfF76b3846"; // .testdao
        this.refundAddress = "0xd43E3C6d04f40C6FDCf63C62C9b24A858C275b26";
      }

      if (this.fProvider) {
        const intfc = new ethers.utils.Interface(DeprecateTld);
        this.refundContract = new ethers.Contract(this.refundAddress, intfc, this.fProvider);

        const isPaused = await this.refundContract.paused();
        this.paused = isPaused;

        const balanceContract = await this.fProvider.getBalance(this.refundAddress);
        this.contractBalance = ethers.utils.formatEther(balanceContract);
      }

      if (this.address) {
        const tldIntfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(this.tldAddress, tldIntfc, this.fProvider);

        // check if address is .web3 holder
        const oldTldBalance = await this.tldContract.balanceOf(this.address);

        if (oldTldBalance > 0) {
          this.canClaim = true;
        }

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
  margin-top: 10px;
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