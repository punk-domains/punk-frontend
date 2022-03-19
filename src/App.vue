<template>
  <Navbar />

  <div class="main-container">
    <router-view></router-view>

    <Footer />
  </div>
  
  <vdapp-board />
</template>

<script lang="ts">
import { onMounted } from "vue";
import { ethers } from 'ethers';
import { useEthers, useWallet } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer
  },

  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const referral = urlParams.get('ref');

    // check if domain name or address
    if (referral && referral.split(".").length === 2) {
      console.log("Likely a domain name")
      // TODO
      // split referral into two (domain name and TLD)
      // ...
    } else if (referral && ethers.utils.isAddress(referral)) { // valid address
      // the last found referral is considered
      localStorage.setItem("referral", referral); // store referral address in local storafe
    }
  },

  computed: {
    ...mapGetters("user", ["getUserSelectedName"]),
  },

  methods: {
    ...mapActions("punk", ["fetchTlds"]),
    ...mapActions("user", ["fetchUserDomainNames"]),

    ...mapMutations("user", ["setUserData"]),
    ...mapMutations("network", ["setNetworkData"]),
    ...mapMutations("punk", ["setFactoryContract"]),

    fetchAllData() {
      this.setUserData();
      this.setNetworkData();
      this.setFactoryContract();
      this.fetchTlds();
    }
  },

  setup() {
    const { address, chainId, isActivated } = useEthers();
    const { connect } = useWallet();

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && localStorage.getItem("connected") == "metamask") {
        connect("metamask");
      }
    })

    return {
      address, chainId, connect, isActivated
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.setUserData();
        this.fetchUserDomainNames(true);
      }
    },

    chainId(newVal, oldVal) {
      if (!this.isActivated && localStorage.getItem("connected") == "metamask") {
        this.connect("metamask");
      }

      if (this.chainId >= 1) {
        this.fetchAllData();
        this.fetchUserDomainNames(true);
      }
    },

    isActivated(newVal, oldVal) {
      if (!localStorage.getItem("connected") && localStorage.getItem("connected") !== "null") {
        // set this to auto-connect on next visit
        localStorage.setItem("connected", "metamask");
      }
    }
  },
}
</script>

<style scoped>
.main-container {
  padding: 20px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
