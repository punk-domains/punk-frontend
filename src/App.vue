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
import { mapActions, mapGetters, mapMutations } from 'vuex';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer
  },

  computed: {
    ...mapGetters("user", ["getUserSelectedName"]),
  },

  methods: {
    ...mapActions("web3panda", ["fetchTlds"]),
    ...mapActions("user", ["fetchDefaultNames"]),

    ...mapMutations("user", ["setUserData"]),
    ...mapMutations("network", ["setNetworkData"]),

    fetchAllData() {
      this.setUserData();
      this.setNetworkData();
      this.fetchTlds();
    }
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
      address, chainId, connect, isActivated
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.setUserData();
        this.fetchDefaultNames();
      }
    },

    chainId(newVal, oldVal) {
      if (!this.isActivated && localStorage.getItem("connected") == "metamask") {
        this.connect("metamask");
      }

      if (this.chainId >= 1) {
        this.fetchAllData();
      }
    },

    getUserSelectedName(newName, oldName) {
      console.log("oldName: " + oldName);
      console.log("newName: " + newName);
    },

    isActivated(newVal, oldVal) {
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
