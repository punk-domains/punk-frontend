<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">

      <div class="row">

        <div class="col-md-12">
          <div class="container text-center">
            <h3>Transfer domain</h3>

            <div class="row mt-5">
              <div class="col-md-6 offset-md-3">
                <input 
                  :value="domainName+'.'+tld"
                  class="form-control text-center"
                  readonly
                >
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-6 offset-md-3">
                <input 
                  v-model="recipient"
                  class="form-control text-center"
                  placeholder="Enter recipient address"
                >
              </div>
            </div>

            <button
              class="btn btn-primary mt-3 mb-5"
              @click="transfer"
              :disabled="waiting || notValid"
            >
              <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Transfer (not enabled yet)
            </button>
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

import Sidebar from '../components/Sidebar.vue';
import WaitingToast from "../components/toasts/WaitingToast.vue";

export default {
  name: "TransferDomain",
  props: ["tld", "domainName"],
  components: {
    Sidebar 
  },

  data() {
    return {
      notValid: true,
      selectedDomain: this.domainName + "." + this.tld,
      recipient: null
    }
  }
}
</script>

<style scoped>

</style>