<template>
  <div class="container text-center">
    <h1 class="mt-5">Get whitelisted for the Punk Angel NFT mint!</h1>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <p>
          <img class="img-fluid angel-img" src="../../assets/angels/angels.gif" />
        </p>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-md-8 offset-md-2">

        <h3 class="mt-5">Wen NFT mint?</h3>

        <p>Soon. But before that, you can whitelist your address to be able to mint before everyone else.</p>

        <h3 class="mt-5">NFT price?</h3>

        <p>$69 per NFT (max supply: 8888 NFTs).</p>

        <h3 class="mt-5">What will the funds be used for?</h3>

        <p>
          To grow the Punk Domains team, expand our marketing operations, get more DAO partnerships, and build cool new 
          features which will make Punk Domains a major web3 domains protocol. 
          See <a target="_blank" href="https://docs.punk.domains/roadmap/">our roadmap here</a>!
        </p>

        <a 
          target="_blank" 
          href="https://forms.gle/RK1zww1Ae5MBLBwZA" 
          class="btn btn-primary btn-lg mt-4 mb-5">
          Join Waitlist
        </a>
      </div>
    </div>

    <!--
    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <h3>Sign up for the waitlist</h3>

        <p class="mt-2">
          Enter the number of NFTs that you plan to mint. Your address will be stored in the waitlist on the blockchain 
          (<strong>no payment</strong> is made at this point).
        </p>

        <div class="d-flex justify-content-center domain-input-container mt-4">
          <div class="input-group mb-3 domain-input input-group-lg">
            <input
              v-model="amount"
              type="number"
              min="1"
              max="100"
              class="form-control text-end"
            >

            <span class="input-group-text nft-addon">
              <span>NFT(s)</span>
            </span>
          </div>
        </div>

        <button
          v-if="isActivated"
          class="btn btn-primary btn-lg mt-2 mb-5"
          @click="joinWaitlist"
          :disabled="waiting || notValid || paused"
        >
          <span v-if="waiting || loading" class="spinner-border spinner-border-sm mx-2" role="status" aria-hidden="true"></span>
          <span v-if="!paused">Join Whitelist</span>
          <span v-if="paused">Paused</span>
        </button>

        <p class="error">{{errorMsg}}</p>

        <button v-if="!isActivated" class="btn btn-primary btn-lg mt-2 mb-5" @click="open">Connect wallet</button>
      </div>
      
    </div>

    <div class="row mt-2">
      <div class="col-md-8 offset-md-2">
        <h3 class="mt-1">Get notified!</h3>

        <p>
          <a target="_blank" href="https://449ly163251.typeform.com/to/onXpPaG2">
            Click here to get notified about the launch!
          </a>
        </p>
      </div>
    </div>
    -->
  </div>

</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";
import { mapGetters } from 'vuex';
import AngelWhitelistAbi from "../../abi/angel/AngelWhitelist.json";
import WaitingToast from "../../components/toasts/WaitingToast.vue";


export default {
  name: "PunkAngelNft",

  data() {
    return {
      amount: 1,
      errorMsg: null,
      loading: false, // loading data
      paused: true,
      waiting: false, // waiting for TX to complete
    }
  },

  created() {
    this.checkPaused()
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),

    getContractAddress() {
      if (this.chainId === 10) {
        // Optimism
        return "0xa562fD780b05B4c6d895ba78D5519Ddf0a5d25D6";
      } else if (this.chainId === 100) {
        // Gnosis Chain
        return "0xC08214D6F73D8F5D06e515862D4A528090f142F5";
      } else if (this.chainId === 137) {
        // Polygon
        return "0x35dFE8d11466649204aa4A3aa0463541b28ee6Bb";
      } else if (this.chainId === 42161) {
        // Arbitrum
        return "0x03bdc5B2EA8176693c25BE1d999900a4FD1CaC59";
      } else if (this.chainId === 80001) {
        // Mumbai
        return "0x7d7143649d8ca8f4BB10A4C43Cd03255E2eB060c";
      }

      return null;
    },

    notValid() {
      if (this.amount < 1 || this.amount > 100) {
        this.errorMsg = "Amount should be between 1 and 100";
        return true;
      } else if (isNaN(this.amount)) {
        this.errorMsg = "Amount must be a number";
        return true;
      }

      this.errorMsg = "";
      return false;
    }
  },

  methods: {
    async joinWaitlist() {
      this.waiting = true;
      const amountUsd = Number(this.amount) * 500;

      const intfc = new ethers.utils.Interface(AngelWhitelistAbi);
      const contract = new ethers.Contract(this.getContractAddress, intfc, this.signer);

      try {
        const tx = await contract.joinWhitelist(amountUsd);

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
          this.toast("You have successfully joined the whitelist!", {
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

    async checkPaused() {
      if (this.isActivated) {
        this.loading = true;

        const intfc = new ethers.utils.Interface(AngelWhitelistAbi);
        const contract = new ethers.Contract(this.getContractAddress, intfc, this.signer);

        this.paused = await contract.paused();

        this.loading = false;
      }
    }
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();

    return { address, chainId, isActivated, open, signer, toast }
  },

  watch: {
    chainId() {
      this.checkPaused();
    },
  }
}
</script>

<style scoped>
.angel-img {
  width: 15em;
}

.domain-input {
  width: 200px;
}

.domain-input-container {
  margin-top: 10px;
}

.nft-addon {
  background-color: white;
}

.error {
  color: #fff;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 50%;
  }
}
</style>