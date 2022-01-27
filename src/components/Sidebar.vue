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
      <i class="bi bi-send"></i> Send tokens
    </router-link>
    
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

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
      return this.getUserSelectedNameImageSvg;
    }
  },
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
  background-color: #1D1E2C;
  border-radius: 10px;
}
</style>