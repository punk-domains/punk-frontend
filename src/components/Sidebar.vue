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

    <router-link class="btn btn-sidebar text-start" to="/">
      <i class="bi bi-cart4"></i> Buy domain
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/search-domain">
      <i class="bi bi-search"></i> Search domain
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/send-tokens">
      <i class="bi bi-send"></i> Send tokens
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/browser">
      <i class="bi bi-window-plus"></i> Browser extension
    </router-link>

    <!--
    <router-link class="btn btn-sidebar text-start" to="/buy-tld">
      <i class="bi bi-window-plus"></i> Buy TLD
    </router-link>
    -->

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
      if (this.getUserSelectedNameImageSvg) {
        return this.getUserSelectedNameImageSvg;
      } else {
        return "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
      }
      
    }
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

.img-thumbnail {
  border-color: transparent;
  border-radius: 15px;
}
</style>