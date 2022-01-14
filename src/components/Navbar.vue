<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img src="../assets/logo.png" alt="" width="30" class="d-inline-block align-bottom navbar-img">
        Web3Panda
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        
        <div class="d-flex ms-auto">
          <div v-if="isActivated" class="">
            <button class="btn btn-primary mx-2">
              {{ getNetworkName }}
            </button>

            <button class="btn btn-primary" @click="this.$router.push('profile')">
              {{ getUserShortAddress }}
            </button>
          </div>

          <button v-else class="btn btn-primary" @click="open">Connect wallet</button>
        </div>

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { useBoard, useEthers } from 'vue-dapp'

export default {
  name: "Navbar",

  computed: {
    ...mapGetters("user", ["getUserShortAddress"]),
    ...mapGetters("network", ["getNetworkName"])
  },
  
  setup() {
    const { open } = useBoard()
    const { isActivated } = useEthers()

    return {
      isActivated, open
    }
  }
}
</script>

<style scoped>
.navbar-dark .navbar-brand {
  color: #DBDFEA;
}

.navbar-dark {
  background-color: #24263A;
  border-radius: 0px 0px 10px 10px;
  padding: 20px;
  
}

.navbar-img {
  margin-right: 5px;
}
</style>
