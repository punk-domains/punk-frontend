<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="container text-center">
        <h2>Profile</h2>

        <p class="text-break">Address: {{address}}</p>
        <p>Balance: {{ displayEther(balance) }} ETH</p>
      </div>
    </div>
  </div>

  
</template>

<script lang="ts">
import { useEthers, displayEther } from 'vue-dapp';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "Profile",

  components: {
    Sidebar
  },

  setup() {
    const { address, balance, isActivated } = useEthers();

    return {
      address, balance, isActivated, displayEther
    }
  }
}
</script>
