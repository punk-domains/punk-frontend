<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="container text-center">
        <h2>Profile</h2>

        <p class="text-break">Address: {{getUserAddress}}</p>
        <p>Balance: {{ getUserBalance }} {{getNetworkCurrency}}</p>
      </div>
    </div>
  </div>

  
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "Profile",

  components: {
    Sidebar
  },

  computed: {
    ...mapGetters("user", ["getUserAddress", "getUserBalance"]),
    ...mapGetters("network", ["getNetworkCurrency"]),
  },
}
</script>
