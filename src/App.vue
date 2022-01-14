<template>
  <Navbar />

  <div class="main-container">
    <router-view></router-view>

    <Footer />
  </div>
  
  <vdapp-board />
</template>

<script lang="ts">
import { onMounted } from "vue"
import { useEthers, useWallet } from 'vue-dapp';
import { mapMutations } from 'vuex';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer
  },

  methods: {
    ...mapMutations("user", ["setUserData"]),
    ...mapMutations("network", ["setNetworkData"]),
  },

  setup() {
    const { address, chainId, isActivated } = useEthers()
    const { connect } = useWallet()

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && localStorage.getItem("connected") == "metamask") {
        connect("metamask");
      }
    })

    return {
      address, chainId, isActivated
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.setUserData();
        this.setNetworkData();
      }
    },

    chainId(newVal, oldVal) {
      if (this.chainId >= 1) {
        this.setUserData();
        this.setNetworkData();
      }
    },

    isActivated(newVal, oldVal) {
      if (newVal) {
        this.setUserData();
        this.setNetworkData();
      }

      if (!localStorage.getItem("connected")) {
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
}
</style>
