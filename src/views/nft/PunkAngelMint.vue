<template>
  <div class="container text-center">

    <h1 class="mt-5">Mint a Punk Angel domain!</h1>

    <h4 class="mt-3">(domain + unique PFP)</h4>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          <img class="img-fluid angel-img rounded-3" src="../../assets/angels/angels.gif" />
        </p>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          Punk Angel is our first domain which gives you both a unique domain name, and also a generative art 
          profile picture (all in one NFT).
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
      Domain price: {{getDomainPrice}} {{payTokenName}}
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
      @click="chosenAllowance=getDomainPrice" 
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

    <div class="row mt-5">
      <div class="col-md-6 offset-md-3">
        <table class="table table-bordered" style="color:#DBDFEA;border-style:none;">
          <thead>
            <tr>
              <th scope="col">Domain length</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 character</td>
              <td>$10 000</td>
            </tr>
            <tr>
              <td>2 characters</td>
              <td>$3 000</td>
            </tr>
            <tr>
              <td>3 characters</td>
              <td>$999</td>
            </tr>
            <tr>
              <td>4 characters</td>
              <td>$199</td>
            </tr>
            <tr>
              <td>5+ characters</td>
              <td>$69</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <h2>FAQ</h2>

        <h4 class="mt-4">What is the max/total supply?</h4>

        <p class="mt-3">
          Max/total supply is between 44 and 6377 domains. It depends on the prices that domains are bought at. 
          If all domains are bought at $69, the max supply is 6377 domains. If some domains are bought at a 
          higher price, the total supply will be lower. If all domains are bought at $10k, the total supply 
          is capped at 44 domains.
        </p>

        <h4 class="mt-5">Can I buy/sell these PFP domains on NFT marketplaces?</h4>

        <p class="mt-3">
          Yes, Punk Angel is available on NFT marketplaces. You can also filter domains by attributes such as 
          domain length, colors in the domain image, expressions (serious, smiling, surprised) and 
          accessories (VR glasses, gas mask).
        </p>

        <h4 class="mt-5">Where are the images stored?</h4>

        <p class="mt-3">
          Punk Angel images are stored completely on-chain in a form of SVG code. We don't rely on any centralized servers 
          or third-party storage solutions such as IPFS. All data is stored within Punk Angel smart contracts on the 
          blockchain. This means that the images will exist forever (or at least as long as Ethereum exists).
        </p>
      </div>
    </div>

  </div>

  <Referral v-if="isActivated" :urlpath="'nft/angel'" />

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
              With each domain buy, the total approval amount is reduced by {{getDomainPrice}} {{payTokenName}}.
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
import MinterAbi from "../../abi/angel/PunkAngelMinter.json";
import TraitsJson from "../../abi/angel/PunkAngelTraits.json";
import tldAbi from '../../abi/FlexiPunkTLD.json';
import Erc20Abi from '../../abi/Erc20.json';

export default {
  name: "PunkAngelMint",

  data() {
    return {
      canMint: true,
      chosenAllowance: 69,
      chosenDomainName: null,
      domainPrice: null,
      idMainnet: 42161,
      idTestnet: 80001,
      loading: false, // loading data
      mintAddressTestnet: "0xf5e50e9e5A20104A927a9D7c49bD6008DB7CA01C",
      mintAddressMainnet: "0xe0fBa63B2C3CCF48C2A14d0D3a29a15e4c17A1fF",
      mintContract: null,
      networkName: "Arbitrum", 
      paused: true,
      payTokenAddressTestnet: "0x8B7387a92c5F645c51Aa8975E76a9c2bfDdBc0F1",
      payTokenAddressMainnet: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      payTokenAllowance: 0,
      payTokenBalance: 0,
      payTokenContract: null,
      payTokenDecimals: 6,
      payTokenName: "USDC",
      randomFeatureIds: [],
      randomFeaturesAmount: 3,
      tld: ".punkangel",
      tldAddressTestnet: "0xBF113092d7ceabB5b891C4B232C910CDF2153AC5",
      tldAddressMainnet: "0xcC66213645474a7B61BAf95330D01e50789eaF4b",
      tldContract: null,
      tldMainnet: ".punkangel",
      tldTestnet: ".testangel",
      waiting: false, // waiting for TX to complete
    }
  },

  components: {
    Referral
  },

  created() {
    this.setContracts();
    this.fetchRandomFeaturesIds();
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getFallbackProvider"]),

    getDomainPrice() {
      if (this.chosenDomainName) {
        if (this.chosenDomainName.length === 1) {
          return 10000;
        } else if (this.chosenDomainName.length === 2) {
          return 3000;
        } else if (this.chosenDomainName.length === 3) {
          return 999;
        } else if (this.chosenDomainName.length === 4) {
          return 199;
        }
      }

      return 69;
    },

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    hasEnoughAllowance() {
      if (this.address && Number(this.payTokenBalance) > 0) {
        if (Number(this.payTokenAllowance) >= Number(this.getDomainPrice)) {
          return true;
        }
      }
      return false;
    },
    hasUserEnoughTokens() {
      if (this.address && Number(this.payTokenBalance) > 0) {
        if (Number(this.payTokenBalance) >= Number(this.getDomainPrice)) {
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
      if (Number(this.chosenAllowance) >= Number(this.getDomainPrice)) {
        return false;
      }
      return true;
    }
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
              text: "STEP 1) Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
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
          this.toast("STEP 1) You have successfully set the allowance! Now PROCEED with STEP 2: buying the domain.", {
            type: TYPE.INFO,
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
          referral,
          this.randomFeatureIds
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "STEP 2) Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
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
          this.toast("STEP 2) You have successfully bought a " + this.tld + " domain!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.setContracts();
          this.addDomainManually(fullDomainName);
          this.fetchRandomFeaturesIds();
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

    fetchRandomFeaturesIds() {
      while (this.randomFeatureIds.length < this.randomFeaturesAmount) {
        const randomTrait = TraitsJson[Math.floor(Math.random() * TraitsJson.length)];
        if (this.randomFeatureIds.indexOf(randomTrait) === -1) {
          this.randomFeatureIds.push(randomTrait);
        }
      }
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

        //const priceWei = await this.mintContract.price();
        //this.domainPrice = ethers.utils.formatUnits(priceWei, this.payTokenDecimals);

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

    /*
    chosenDomainName() {
      if (this.chosenDomainName) {
        if (this.chosenDomainName.length === 1) {
          this.domainPrice = 10000;
        } else if (this.chosenDomainName.length === 2) {
          this.domainPrice = 3000;
        } else if (this.chosenDomainName.length === 3) {
          this.domainPrice = 999;
        } else if (this.chosenDomainName.length === 4) {
          this.domainPrice = 199;
        } else {
          this.domainPrice = 69;
        }
      } else {
        this.domainPrice = 69;
      }
    }*/
  }
}
</script>

<style scoped>
.angel-img {
  width: 15em;
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