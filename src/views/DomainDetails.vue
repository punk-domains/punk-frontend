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

      <div class="row" v-if="isActivated && isCorrectChainForDomain && !domainData">
        <div class="col-md-12">
          <div class="alert alert-warning" role="alert">
            If data does not show in a reasonable amount of time, reload the page.
          </div>
        </div>
      </div>

      <div class="row" v-if="!isCorrectChainForDomain">
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
              <div class="col-sm-3 punk-title">
                Holder address
              </div>

              <div class="col-sm-9 punk-text text-break">
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

            <EditOtherData
              :domainData="domainData" 
              :tld="tld" 
              :domainName="domainName" 
              @fetchData="fetchData" 
            />

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
import { useToast, TYPE } from "vue-toastification";

import EditOtherData from "../components/domainEdit/EditOtherData.vue";
import EditPfp from "../components/domainEdit/EditPfp.vue";
import EditUrl from "../components/domainEdit/EditUrl.vue";
import Sidebar from '../components/Sidebar.vue';
import tldAbi from "../abi/PunkTLD.json";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "DomainDetails",
  props: ["domainChain", "tld", "domainName"],
  components: { 
    EditOtherData,
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
    if (!this.tldContract) {
      this.setContract();
    }
      
    if (this.getTldAddresses && JSON.stringify(this.getTldAddresses) != "{}") {
      this.fetchData();
    }
  },

  computed: {
    ...mapGetters("punk", ["getTldAddressesKey", "getTldAddresses"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl", "getChainId", "getSupportedNetworks", "isNetworkSupported"]),

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

        console.log("this.domainData");
        console.log(this.domainData);

        if (this.domainData && this.domainData.holder !== ethers.constants.AddressZero) {
          let metadata;

          console.log("this.domainData.tokenId 1");
          console.log(this.domainData.tokenId);
            
          if (this.domainData.pfpAddress !== ethers.constants.AddressZero) {
            // fetch image URL of that PFP
            const pfpInterface = new ethers.utils.Interface([
              "function tokenURI(uint256 tokenId) public view returns (string memory)"
            ]);
            const pfpContract = new ethers.Contract(this.domainData.pfpAddress, pfpInterface, this.signer);
            metadata = await pfpContract.tokenURI(this.domainData.pfpTokenId);
          } else {
            // get contract image for that token ID
            metadata = await this.tldContract.tokenURI(this.domainData.tokenId);
          }

          console.log("this.domainData.tokenId 2");
          console.log(this.domainData.pfpTokenId);

          console.log("metadata:");
          console.log(metadata);

          if (metadata.includes("ipfs://")) {
            metadata = metadata.replace("ipfs://", "https://ipfs.io/ipfs/");
          }
          
          if (metadata.includes("http")) {
            const response = await fetch(metadata);
            const result = await response.json();

            if (result && result.image) {
              if (result.image.includes("ipfs://")) {
                this.pfpImage = result.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              } else {
                this.pfpImage = result.image;
              }
            }
          }
          else if (metadata) {
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

.punk-text {
  text-align: left;
}

@media only screen and (max-width: 767px) {
  .punk-text {
    text-align: center;
  }

  .punk-title {
    font-size: 1.1em;
    margin-bottom: 5px;
    font-weight: bold;
  }
}
</style>