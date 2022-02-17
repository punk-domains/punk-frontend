<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="row">

        <div class="col-md-12 mb-3">
          <div class="container text-center">
            <h3>Find an existing domain</h3>

            <div class="row mt-5">
              <div class="col-md-6 offset-md-3">
                <input 
                  v-model="query"
                  class="form-control text-center"
                  placeholder="Enter a domain name"
                >
              </div>
            </div>

            <button
              class="btn btn-primary mt-3 mb-5"
              @click="findDomain"
              :disabled="waiting || notValid"
            >
              <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Search
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
import tldAbi from "../abi/PunkTLD.json";
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "SearchDomains",

  components: {
    Sidebar
  },

  data() {
    return {
      query: null,
      waiting: false
    }
  },

  computed: {
    ...mapGetters("network", ["getChainId"]),
    ...mapGetters("punk", ["getTldAddressesKey", "getTldAddresses"]),

    notValid() {
      if (!this.query) {
        return true;
      } else if (!this.query.includes(".")) {
        return true;
      } else if (this.query.includes(" ")) {
        return true;
      } else if (this.query.includes("%")) {
        return true;
      } else if (this.query.includes("&")) {
        return true;
      } else if (this.query.includes("?")) {
        return true;
      } else if (this.query.includes("#")) {
        return true;
      } else if (this.query.includes("/")) {
        return true;
      }

      return false;
    },
  },

  methods: {
    async findDomain() {
      this.waiting = true;

      try {
        const domainName = this.query.split(".")[0]
        const tld = this.query.split(".")[1]

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
            this.toast("This TLD does not exist.", {type: TYPE.ERROR});
            this.waiting = false;
            return;
          }

          // construct contract
          const intfc = new ethers.utils.Interface(tldAbi);
          const tldContract = new ethers.Contract(tldAddr, intfc, this.signer);

          const existingHolder = await tldContract.getDomainHolder(domainName);

          if (existingHolder === ethers.constants.AddressZero) {
            // if not exists (holder is 0x0), show a toast
            this.toast("This domain name has not been registered yet.", {type: TYPE.INFO});
            this.waiting = false;
            return;
          } else {
            // if domain exists, redirect to the Domain Details page
            this.$router.push({name: 'DomainDetails', params: {domainChain: this.getChainId, tld: tld, domainName: domainName}});
          }
        }
      } catch {
        this.toast("You have entered an incorrect domain.", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }
    }
  },

  setup() {
    const { signer } = useEthers()
    const toast = useToast();

    return { signer, toast }
  },
}
</script>

<style scoped>

</style>