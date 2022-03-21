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
                  <span id="balance" @click="tokenAmount=tokenBalance">{{formatTokenBalance}} {{selectedToken}}</span>
                </small>
              </div>
            </div>

            <button
              class="btn btn-primary mt-4 mb-5"
              :disabled="notValid || waiting"
              @click="validateDomainName"
              data-bs-toggle="modal" data-bs-target="#sendTokensModal"
            >
              <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
            Please review the data before you send {{selectedToken}} to {{domainLowerCase}}.
          </p>

          <div class="row mb-3 mt-4">
            <div class="col-sm-3">
              <strong>Recipient</strong>
            </div>

            <div class="col-sm-9">
              <span>{{domainLowerCase}}</span>
              <span class="domain-error" v-if="domainError">Error: {{domainError}}</span>
            </div>
          </div>

          <div class="row mb-3 mt-2" v-if="receiverAddress">
            <div class="col-sm-3">
              <strong>Recipient address</strong>
            </div>

            <div class="col-sm-9">
              <span class="text-break">{{receiverAddress}}</span>
              <span class="domain-error" v-if="receiverAddress == address">Error: You are sending tokens to yourself.</span>
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
      tokenBalance: 0, // max token balance of sender
      selectedToken: null,
      selectedTokenDecimals: null,
      tokenAmount: null, // amount to be sent
      waiting: false
    }
  },

  created() {
    if (this.getChainId >= 1) {
      this.selectedToken = Object.keys(this.getTokens)[0];
      this.tokenBalance = ethers.utils.formatEther(this.balance);
    }
  },

  computed: {
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getChainId", "getNetworkName", "getTokens"]),
    ...mapGetters("user", ["getUserBalance"]),
    ...mapGetters("punk", ["getTldAddressesKey", "getTldAddresses", "getTldAbi"]),

    domainLowerCase() {
      if (this.receiver) {
        return this.receiver.toLowerCase();
      }
      
      return null;
    },

    formatTokenBalance() {
      if (this.tokenBalance > 100) {
        return Number(this.tokenBalance).toFixed(2);
      } else {
        return Number(this.tokenBalance).toFixed(4);
      }
    },

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
        this.tokenBalance = ethers.utils.formatEther(this.balance);
      } else {
        const intfc = new ethers.utils.Interface(Erc20Abi);
        const tokenContract = new ethers.Contract(tokenAddr, intfc, this.signer);

        const balanceWei = await tokenContract.balanceOf(this.address);

        if (Number(balanceWei) > 0) {
          const decimals = await tokenContract.decimals();
          this.selectedTokenDecimals = Number(decimals);
          this.tokenBalance = ethers.utils.formatUnits(balanceWei, this.selectedTokenDecimals);
        } else {
          this.tokenBalance = 0;
        }
      }
    },

    selectToken(tokenName) {
      this.selectedToken = tokenName;
      this.getTokenBalance(tokenName);
    },

    send() {
      if (this.getTokens[this.selectedToken] === "0x0") {
        this.sendNativeTokens();
      } else {
        this.sendErc20Tokens();
      }
    },

    async sendErc20Tokens() {
      this.waiting = true;

      try {
        const sToken = this.selectedToken;
        const tAmount = this.tokenAmount;
        const recDomain = this.domainLowerCase;

        const valueWei = ethers.utils.parseUnits(tAmount, this.selectedTokenDecimals);

        const tokenAddr = this.getTokens[sToken];
        
        const intfc = new ethers.utils.Interface(Erc20Abi);
        const tokenContract = new ethers.Contract(tokenAddr, intfc, this.signer);

        const tx = await tokenContract.transfer(this.receiverAddress, valueWei);

        document.getElementById('closeSendModal').click();

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
          this.toast("You have successfully sent " + tAmount + " " + sToken + " to " + recDomain + "!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waiting = false;
          this.getTokenBalance(sToken);
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
        this.waiting = false;
        console.log(e);
        this.toast(e.message, {type: TYPE.ERROR});
      }
    },

    async sendNativeTokens() {
      this.waiting = true;

      try {
        const sToken = this.selectedToken;
        const tAmount = this.tokenAmount;
        const recDomain = this.domainLowerCase;

        const valueWei = ethers.utils.parseEther(tAmount);
        
        const tx = await this.signer.sendTransaction({
          to: this.receiverAddress,
          value: valueWei
        });

        document.getElementById('closeSendModal').click();

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
          this.toast("You have successfully sent " + tAmount + " " + sToken + " to " + recDomain + "!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waiting = false;
          this.getTokenBalance(sToken);
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
        this.waiting = false;
        console.log(e);
        this.toast(e.message, {type: TYPE.ERROR});
      }
    },

    async validateDomainName() {
      this.domainError = null;

      try {
        const domainName = this.domainLowerCase.split(".")[0]
        const tld = this.domainLowerCase.split(".")[1]

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
          const intfc = new ethers.utils.Interface(this.getTldAbi);
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
    const { address, balance, signer } = useEthers()
    const toast = useToast();

    return { address, balance, signer, toast }
  },

  watch: {
    getChainId() {
      if (this.getChainId >= 1) {
        this.selectedToken = Object.keys(this.getTokens)[0];
        this.tokenBalance = this.getUserBalance;
      }
    },

    address() {
      this.getTokenBalance(this.selectedToken);
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