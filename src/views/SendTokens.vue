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
              @click="validateDomainName"
              data-bs-toggle="modal" data-bs-target="#sendTokensModal"
            >
              Send tokens
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>

  <!-- Send tokens modal -->
  <div class="modal fade text-start" id="sendTokensModal" tabindex="-1" aria-labelledby="sendTokensModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="sendTokensModalLabel">Confirm sending {{selectedToken}}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>
            Please review the data before you send {{selectedToken}} to {{receiver}}.
          </p>

          <div class="row mb-3 mt-4">
            <div class="col-sm-3">
              <strong>Recipient</strong>
            </div>

            <div class="col-sm-9">
              <span>{{receiver}}</span>
              <span class="domain-error" v-if="domainError">Error: {{domainError}}</span>
            </div>
          </div>

          <div class="row mb-3 mt-2" v-if="receiverAddress">
            <div class="col-sm-3">
              <strong>Recipient address</strong>
            </div>

            <div class="col-sm-9">
              <span class="text-break">{{receiverAddress}}</span>
            </div>
          </div>

          <div class="row mb-3 mt-2">
            <div class="col-sm-3">
              <strong>Amount</strong>
            </div>

            <div class="col-sm-9">
              <span class="text-break">{{tokenAmount}} {{selectedToken}}</span>
            </div>
          </div>

          <div class="row mb-3 mt-2" v-if="getTokens[selectedToken] !== '0x0'">
            <div class="col-sm-3">
              <strong>Token address</strong>
            </div>

            <div class="col-sm-9">
              <span class="text-break">{{getTokens[selectedToken]}}</span>
            </div>
          </div>

          <div class="row mb-3 mt-2">
            <div class="col-sm-3">
              <strong>Network</strong>
            </div>

            <div class="col-sm-9">
              <span class="text-break">{{getNetworkName}}</span>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="send" 
            :disabled="waiting || domainError"
          >Send {{selectedToken}}</button>

          <button id="closeSendModal" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
import tldAbi from "../abi/PunkTLD.json";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "SendTokens",

  components: {
    Sidebar
  },

  data() {
    return {
      domainError: null,
      filterTokens: null,
      receiver: null,
      receiverAddress: null,
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
    ...mapGetters("network", ["getChainId", "getNetworkCurrency", "getNetworkName", "getTokens"]),
    ...mapGetters("user", ["getUserBalance"]),
    ...mapGetters("punk", ["getTldAddressesKey", "getTldAddresses"]),

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
      } else if (Number(this.tokenAmount) <= 0) {
        return true;
      } else if (Number(this.tokenAmount) > Number(this.tokenBalance)) {
        return true;
      }

      return false;
    }
  },

  methods: {
    async getTokenBalance(tokenName) {
      const tokenAddr = this.getTokens[tokenName];

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
    },

    async validateDomainName() {
      this.domainError = null;

      try {
        const domainName = this.receiver.split(".")[0]
        const tld = this.receiver.split(".")[1]

        let tldAddresses = this.getTldAddresses;

        if (!tldAddresses) {
          const tldAddressesStorage = localStorage.getItem(this.getTldAddressesKey);

          if (tldAddressesStorage) {
            tldAddresses = JSON.parse(tldAddressesStorage);
          }
        }

        if (tldAddresses && JSON.stringify(tldAddresses) != "{}") {
          const tldAddr = tldAddresses["."+tld];

          if (!tldAddr) {
            this.domainError = "This TLD does not exist.";
            return;
          }

          // construct contract
          const intfc = new ethers.utils.Interface(tldAbi);
          const tldContract = new ethers.Contract(tldAddr, intfc, this.signer);

          const existingHolder = await tldContract.getDomainHolder(domainName);

          if (existingHolder === ethers.constants.AddressZero) {
            // if not exists (holder is 0x0), show a toast
            this.domainError = "This domain name has not been registered yet.";
            return;
          } else {
            // if domain exists, redirect to the Domain Details page
            this.receiverAddress = existingHolder;
            return;
          }
        }
      } catch {
        this.domainError = "You have entered an incorrect domain.";
        return;
      }
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

.domain-error {
  color: red;
  margin-left: 5px;
}
</style>