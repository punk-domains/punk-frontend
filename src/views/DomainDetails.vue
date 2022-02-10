<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">

      <!-- Alerts -->
      <div class="row" v-if="!isActivated">
        <div class="col-md-12">
          <div class="alert alert-warning" role="alert">
            Connect wallet to see more data.
          </div>
        </div>
      </div>

      <div class="row" v-if="isActivated && isNetworkSupported && !domainData">
        <div class="col-md-12">
          <div class="alert alert-warning" role="alert">
            If data does not show in a reasonable amount of time, reload the page.
          </div>
        </div>
      </div>

      <div class="row" v-if="domainData && !isCorrectChainForDomain">
        <div class="col-md-12">
          <div class="alert alert-warning" role="alert">
            Please switch your network to {{getSupportedNetworks[domainChain]}}.
          </div>
        </div>
      </div>
      <!-- End Alerts -->

      <div class="row">
        <div class="col-md-12">
          <div class="container text-center">
            <h3>{{domainName}}.{{tld}}</h3>

            <img class="img-thumbnail domain-image" :src="pfpImage" />

            <div class="mb-3 row domain-data mt-4" v-if="domainData">
              <div class="col-sm-3">
                Holder address
              </div>

              <div class="col-sm-9 text-start">
                {{holderData}}
              </div>
            </div>

            <div class="mb-3 row domain-data mt-4" v-if="domainData">
              <div class="col-sm-3">
                URL
              </div>

              <div class="col-sm-9 text-start">
                <span>{{urlData}}</span>

                <button 
                  class="btn btn-primary btn-sm mx-3"
                  data-bs-toggle="modal" data-bs-target="#editUrlModal"
                >Edit</button>
              </div>
            </div>

            <div class="mb-3 row domain-data mt-4" v-if="domainData">
              <div class="col-sm-3">
                Custom PFP
              </div>

              <div class="col-sm-9 text-start">
                {{customPfp}}
              </div>
            </div>


            <div class="mb-3 row domain-data mt-4" v-if="customData && customData.description">
              <label for="staticDescription" class="col-sm-3 col-form-label">Description</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext domain-data" id="staticDescription" :value="customData.description">
              </div>
            </div>

            <div class="mb-3 row domain-data mt-4" v-if="customData && customData.twitter">
              <label for="staticTwitter" class="col-sm-3 col-form-label">Twitter</label>
              <div class="col-sm-9">
                <input type="text" readonly class="form-control-plaintext domain-data" id="staticTwitter" :value="customData.twitter">
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Edit URL Modal -->
  <div class="modal fade" id="editUrlModal" tabindex="-1" aria-labelledby="editUrlModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editUrlModalLabel">Edit URL</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>
            Anyone who's using the Web3Panda browser extension will get redirected to this URL if they enter 
            {{domainName}}.{{tld}} in the browser URL bar.
          </p>

          <div class="mb-3" v-if="domainData">
            <input
              type="text" 
              class="form-control" 
              ref="urlInput" 
              placeholder="Enter URL"
              :value="domainData.url"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button id="closeUrlModal" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="editUrl">Edit URL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { mapGetters } from 'vuex';
import { useEthers } from 'vue-dapp';
import tldAbi from "../abi/Web3PandaTLD.json";
import Sidebar from '../components/Sidebar.vue';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "DomainDetails",
  props: ["domainChain", "tld", "domainName"],
  components: { Sidebar },

  data() {
    return {
      tldContract: null,
      domainData: null,
      pfpImage: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg",
    }
  },

  created() {
    // fetch existing data from blockchain
    if (this.getTldAddresses && JSON.stringify(this.getTldAddresses) != "{}") {
      this.fetchData();
    }
  },

  computed: {
    ...mapGetters("web3panda", ["getTldAddressesKey", "getTldAddresses"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getChainId", "getSupportedNetworks", "isNetworkSupported"]),

    customData() {
      if (this.domainData) {
        try {
          return JSON.parse(this.domainData.data);
        } catch {
          return null
        }
      }

      return null
    },

    customPfp() {
      if (this.domainData.pfpAddress != ethers.constants.AddressZero) {
        return this.domainData.pfpAddress + "(token ID: " + this.domainData.pfpTokenId + ")";
      }

      return "Custom PFP not set yet."
    },

    holderData() {
      if (this.domainData.holder !== ethers.constants.AddressZero) {
        return this.domainData.holder;
      }

      return "This domain name is not owned by anyone yet."
    },

    isCorrectChainForDomain() {
      if (Number(this.domainChain) === Number(this.getChainId)) {
        return true;
      }

      return false;
    },

    urlData() {
      if (this.domainData.url) {
        return this.domainData.url;
      }

      return "Redirect URL not set yet."
    }
  },

  methods: {
    async editUrl() {
      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        const tx = await this.tldContract.editUrl(this.domainName, this.$refs.urlInput.value);

        document.getElementById('closeUrlModal').click();

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
          this.toast("You have successfully updated the URL!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchData();
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {type: TYPE.ERROR});
        }
      }
    },

    async fetchData() {
      if (!this.tldContract) {
        this.setContract();
      }

      if (this.tldContract) {
        // get domain data
        this.domainData = await this.tldContract.domains(this.domainName);

        if (this.domainData && this.domainData.holder !== ethers.constants.AddressZero) {
          let metadata;
            
          if (this.domainData.pfpAddress !== ethers.constants.AddressZero) {
            // fetch image URL of that PFP
            const pfpInterface = new ethers.utils.Interface([
              "function tokenURI(uint256 tokenId) public view returns (string memory)"
            ]);
            const pfpContract = new ethers.Contract(this.domainData.pfpAddress, pfpInterface, this.signer);
            metadata = await pfpContract.tokenURI(this.domainData.tokenId);
          } else {
            // get contract image for that token ID
            metadata = await this.tldContract.tokenURI(this.domainData.tokenId);
          }

          if (metadata) {
            const json = atob(metadata.substring(29));
            const result = JSON.parse(json);

            if (result && result.image) {
              this.pfpImage = result.image;
            }
            
          }
        }
      }
    },

    setContract() {
      let tldAddresses = this.getTldAddresses;

      if (!tldAddresses) {
        const tldAddressesStorage = localStorage.getItem(this.getTldAddressesKey);

        if (tldAddressesStorage) {
          tldAddresses = JSON.parse(tldAddressesStorage);
        }
      }

      if (tldAddresses && JSON.stringify(tldAddresses) != "{}") {
        const tldAddr = tldAddresses["."+this.tld];

        // construct contract
        const intfc = new ethers.utils.Interface(tldAbi);
        this.tldContract = new ethers.Contract(tldAddr, intfc, this.signer);
      }
    }
  },

  setup() {
    const { chainId, isActivated, signer } = useEthers();
    const toast = useToast();

    return { chainId, isActivated, signer, toast }
  },

  watch: {
    getTldAddresses(newVal, oldVal) {
      if (newVal && JSON.stringify(newVal) != "{}") {
        this.fetchData();
      }
    },
    chainId() {
      this.fetchData();
    }
  }
}
</script>

<style scoped>
.domain-image {
  max-width: 200px;
}

.form-control-plaintext {
  color: #DBDFEA;
}
</style>