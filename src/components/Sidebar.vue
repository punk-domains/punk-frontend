<template>
  <div class="container">

    <img :src="getUserImage" class="img-fluid img-thumbnail">

    <h3 class="text-center mt-2 text-break">
      {{getNameOrAddress}}
    </h3>

    <hr />

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-person"></i> Profile
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-search"></i> Search domain
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="#">
      <i class="bi bi-send"></i> Send tokens
    </router-link>

    <a class="btn btn-sidebar text-start" @click="disconnectWallet">
      <i class="bi bi-x-circle"></i> Disconnect
    </a>
    
    <!--
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-arrow-repeat"></i> Swap tokens
    </router-link>
    
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-piggy-bank"></i> Lend tokens
    </router-link>
    
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-trophy"></i> Win tokens
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-tree"></i> Help environment
    </router-link>
    -->

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useWallet } from 'vue-dapp';

export default {
  name: "Sidebar",

  computed: {
    ...mapGetters("user", ["getUserSelectedName", "getUserShortAddress", "getUserSelectedNameImageSvg"]),

    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserShortAddress;
      }
    },

    getUserImage() {
      if (this.getUserSelectedNameImageSvg) {
        return this.getUserSelectedNameImageSvg;
      } else {
        return "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
      }
      
    }
  },

  methods: {
    disconnectWallet() {
      localStorage.setItem("connected", null);
      this.disconnect();
      this.$router.push({name: 'Home'});
    }
  },

  setup() {
    const { disconnect } = useWallet();

    return { disconnect }
  }
}
</script>

<style scoped>
.bi {
  margin-right: 5px;
}

.btn-sidebar, .btn-sidebar:focus {
  padding: 10px;
  width: 100%;
  color: #DBDFEA;
  text-decoration: none;
  box-shadow: none;
}

.btn-sidebar:hover {
  color: #DBDFEA;
  border-color: #DBDFEA;
  border-radius: 10px;
}
</style>