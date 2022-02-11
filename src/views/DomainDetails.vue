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

            <EditUrl 
              :domainData="domainData" 
              :tld="tld" 
              :domainName="domainName" 
              @fetchData="fetchData" 
            />

            <EditPfp
              :domainData="domainData" 
              :tld="tld" 
              :domainName="domainName" 
              @fetchData="fetchData"  
            />

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


</template>

<script>
import { ethers } from 'ethers';
import { mapGetters } from 'vuex';
import { useEthers } from 'vue-dapp';
import tldAbi from "../abi/Web3PandaTLD.json";
import Sidebar from '../components/Sidebar.vue';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import EditUrl from "../components/domainEdit/EditUrl.vue";
import EditPfp from "../components/domainEdit/EditPfp.vue";

export default {
  name: "DomainDetails",
  props: ["domainChain", "tld", "domainName"],
  components: { 
    EditPfp,
    EditUrl, 
    Sidebar 
  },

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
    }
  },

  methods: {
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