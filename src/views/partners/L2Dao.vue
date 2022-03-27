<template>
  <div class="container text-center">
    <h1 class="mt-5">L2DAO & Punk Domains</h1>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { displayEther, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../../components/toasts/WaitingToast.vue";
import useDomainHelpers from "../../hooks/useDomainHelpers";

export default {
  name: "L2Dao",
}
</script>

<style scoped>

</style>