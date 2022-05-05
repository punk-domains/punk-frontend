<template>
<div class="container text-center">
  <h1 class="text-center">Buy a top-level domain</h1>
  
  <div class="row mt-3">
    <div class="col-md-8 offset-md-2">
      <p class="text-center">
        Punk Domains protocol allows anyone to create and own a top-level domain. As a TLD holder you have complete 
        control over it and you earn revenue from selling domains.
      </p>

      <div class="d-flex justify-content-center domain-input-container mt-5">
        <div class="input-group mb-3 domain-input input-group-lg">
          <input
            v-model="chosenTldName" 
            placeholder="enter top-level domain to buy"
            type="text" 
            class="form-control text-center"
          >
        </div>
      </div>

      <p class="mt-3 text-center">
        Domain price: {{this.parseValue(this.selectedPrice)}} {{getNetworkCurrency}}
      </p>

      <button class="btn btn-primary btn-lg mt-1 buy-button" @click="buyDomain" :disabled="waiting || tldBuyNotValid(chosenTldName).invalid">
        <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span v-if="!chosenTldName">Buy TLD</span>
        <span v-if="chosenTldName">Buy {{chosenTldName}}!</span>
      </button>

      <p class="error text-center mt-2" v-if="tldBuyNotValid(chosenTldName).invalid">
        <small>
          <em>{{ tldBuyNotValid(chosenTldName).message }}</em>
        </small>
      </p>

    </div>
  </div>
</div>
</template>

<script lang="ts">
  import { ethers } from 'ethers';
  import { displayEther, useEthers } from 'vue-dapp';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { useToast, TYPE } from "vue-toastification";
  import WaitingToast from "../components/toasts/WaitingToast.vue";
  import useDomainHelpers from "../hooks/useDomainHelpers";

  export default {
    name: "TldBuy",

    data() {
      return {
        chosenTldName: null
      }
    },

    methods: {
      parseValue(someVal) {
        if (someVal) {
          return ethers.utils.formatEther(someVal);
        }
      }
    },

    setup() {
      const { address, isActivated, signer } = useEthers()
      const toast = useToast();
      const { tldBuyNotValid } = useDomainHelpers();

      return { address, isActivated, displayEther, signer, tldBuyNotValid, toast }
    },
  }
</script>

<style scoped>
p {
  text-align: justify;
  font-size: 1.1em;
}

h3 {
  margin-top: 35px;
}
</style>