<template>

  <div class="row">

    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="row">

        <div class="col-md-12 mb-3">
          <div class="container text-center">
            <h3>Send tokens to a domain</h3>

            <!-- Recipient -->
            <div class="row mt-5">
              <div class="col-md-6 offset-md-3">
                <input 
                  v-model="receiver"
                  class="form-control text-center"
                  placeholder="Enter the receiver's domain name"
                >
              </div>
            </div>

            <!-- Tokens -->
            <div class="row mt-4">
              <div class="col-md-4 offset-md-4">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control text-end"
                    v-model="tokenAmount"
                    placeholder="0.0" 
                  />

                  <button 
                    class="btn btn-primary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {{selectedToken}}
                  </button>
                  
                  <div class="dropdown-menu p-2">
                    <div class="mb-3">
                      <input 
                        class="form-control mb-2" 
                        placeholder="Filter tokens"
                        v-model="filterTokens" 
                      />

                      <li>
                        <button 
                          class="dropdown-item" 
                          type="button"
                          v-for="token in getTokenNames"
                          @click="selectToken(token)"
                        >{{token}}</button>
                      </li>
                    </div>
                  </div>
                </div>

                <small>
                  Balance: 
                  <span id="balance" @click="tokenAmount=tokenBalance">{{tokenBalance}} {{selectedToken}}</span>
                </small>
              </div>
            </div>

            <button
              class="btn btn-primary mt-4 mb-5"
              :disabled="notValid"
            >
              Send tokens
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>

</template>

<script lang="ts">
import { ethers } from 'ethers';
import { mapGetters } from 'vuex';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";

import Sidebar from '../components/Sidebar.vue';
import Erc20Abi from "../abi/Erc20.json";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "SendTokens",

  components: {
    Sidebar
  },

  data() {
    return {
      filterTokens: null,
      receiver: null,
      tokenBalance: 0,
      selectedToken: null,
      tokenAmount: null,
      waiting: false
    }
  },

  created() {
    if (this.getChainId >= 1) {
      this.selectedToken = Object.keys(this.getTokens)[0];
      this.tokenBalance = this.getUserBalance;
    }
  },

  computed: {
    ...mapGetters("network", ["getChainId", "getNetworkCurrency", "getTokens"]),
    ...mapGetters("user", ["getUserBalance"]),

    getTokenNames() {
      if (this.getTokens && !this.filterTokens) {
        return Object.keys(this.getTokens); // all tokens
      } else if (this.getTokens && this.filterTokens) {
        return Object.keys(this.getTokens).filter(item => item.includes(this.filterTokens.toUpperCase())); //filtered
      } 
    },

    notValid() {
      if (!this.receiver) {
        return true;
      } else if (!this.receiver.includes(".")) {
        return true;
      } else if (this.receiver.includes(" ")) {
        return true;
      } else if (this.receiver.includes("%")) {
        return true;
      } else if (this.receiver.includes("&")) {
        return true;
      } else if (this.receiver.includes("?")) {
        return true;
      } else if (this.receiver.includes("#")) {
        return true;
      } else if (this.receiver.includes("/")) {
        return true;
      } else if (!this.tokenAmount) {
        return true;
      } else if (isNaN(this.tokenAmount)) {
        return true;
      } else if (this.tokenAmount <= 0) {
        return true;
      }

      return false;
    }
  },

  methods: {
    async getTokenBalance(tokenName) {
      const tokenAddr = this.getTokens[tokenName];

      console.log(tokenAddr);

      if (tokenAddr === "0x0") {
        this.tokenBalance = this.getUserBalance;
      } else {
        const intfc = new ethers.utils.Interface(Erc20Abi);
        const tokenContract = new ethers.Contract(tokenAddr, intfc, this.signer);

        const balanceWei = await tokenContract.balanceOf(this.address);

        if (Number(balanceWei) > 0) {
          const decimals = await tokenContract.decimals();
          this.tokenBalance = ethers.utils.formatUnits(balanceWei, Number(decimals));
        } else {
          this.tokenBalance = 0;
        }
      }
    },

    selectToken(tokenName) {
      this.selectedToken = tokenName;
      this.getTokenBalance(tokenName);
    }
  },

  setup() {
    const { address, signer } = useEthers()
    const toast = useToast();

    return { address, signer, toast }
  },

  watch: {
    getChainId() {
      if (this.getChainId >= 1) {
        this.selectedToken = Object.keys(this.getTokens)[0];
        this.tokenBalance = this.getUserBalance;
      }
    }
  }
}
</script>

<style scoped>
#balance {
  text-decoration: underline;
  cursor: pointer;
}

#balance:hover {
  text-decoration: none;
}
</style>