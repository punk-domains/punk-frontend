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
            <!-- Account -->
            <button class="btn btn-primary" @click="this.$router.push('profile')">
              {{ shortenAddress(address) }}
            </button>
          </div>

          <button v-else class="btn btn-primary" @click="open">Connect wallet</button>
        </div>

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { useBoard, useEthers, shortenAddress } from 'vue-dapp'

export default {
  name: "Navbar",
  
  setup() {
    const { open } = useBoard()
    const { address, isActivated } = useEthers()

    return {
      address, isActivated, open, shortenAddress
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
