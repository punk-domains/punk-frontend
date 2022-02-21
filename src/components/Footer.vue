<template>
  <div class="container-fluid text-center mt-3">
    <router-link v-if="isActivated && isNetworkSupported" to="/profile">Profile</router-link>
    
    <span v-if="isActivated && isNetworkSupported"> | </span>

    <router-link to="/about">About</router-link>
    
    <span> | </span>

    <router-link to="/how">How it works</router-link>
    
    <span> | </span>

    <a target="_blank" href="https://github.com/punk-domains">GitHub</a>
    
    <span> | </span>

    <router-link v-if="isActivated && isNetworkSupported" to="/">Buy domain</router-link>

    <span v-if="isActivated && isNetworkSupported"> | </span>

    <router-link v-if="isActivated && isNetworkSupported" to="/search-domain">Search domain</router-link>
    
    <span v-if="isActivated && isNetworkSupported"> | </span>

    <router-link v-if="isActivated && isNetworkSupported" to="/browser">Browser extension</router-link>
    
    <span v-if="isActivated && isNetworkSupported"> | </span>

    <a target="_blank" href="https://icons8.com/icon/f34LtRddK1jj/man">Man</a> 
    icon by <a target="_blank" href="https://icons8.com">Icons8</a>
  </div>
</template>

<script>
import { useEthers } from 'vue-dapp';
import { mapGetters } from 'vuex';

export default {
  name: "Footer",

  computed: {
    ...mapGetters("network", ["isNetworkSupported"]),
    
  },

  setup() {
    const { isActivated } = useEthers()
    return { isActivated }
  },
}
</script>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.container-fluid {
  /*background-color: #24263A;*/
  background-color: transparent;
  padding: 20px 0px;
  border-radius: 10px;
}
</style>