<template>
  <div class="mb-3 row domain-data mt-4" v-if="customData" v-for="(dataValue, dataKey) in customData">
    <div class="col-sm-3 punk-title">
      {{dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}}
    </div>

    <div class="col-sm-9 punk-text">
      {{dataValue}}
    </div>
  </div>

  <button 
    v-if="isOwner"
    class="btn btn-primary btn-lg mx-3 mt-3"
    data-bs-toggle="modal" data-bs-target="#editDataModal"
  >Edit data</button>
</template>

<script>
import { ethers } from 'ethers';
import { mapGetters } from 'vuex';
import { useEthers } from 'vue-dapp';
import tldAbi from "../../abi/PunkTLD.json";
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../toasts/WaitingToast.vue";

export default {
  name: "EditOtherData",
  emits: ["fetchData"],
  props: ["domainData", "tld", "domainName"],

  computed: {
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

    isOwner() {
      return String(this.address).toLowerCase() === String(this.domainData.holder).toLowerCase();
    },
  },

  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();

    return { address, signer, toast }
  },
}
</script>

<style scoped>
.form-control-plaintext {
  color: #DBDFEA;
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