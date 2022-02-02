<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="row">

        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Address</h3>
            <p class="text-break">{{getUserAddress}}</p>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Balance</h3>
            <p class="text-break">{{ getUserBalance }} {{getNetworkCurrency}}</p>
          </div>
        </div>

      </div>

      <div class="row mb-3" v-if="getUserSelectedNameData.data || getUserSelectedNameData.url">
        <div class="col-md-12">
          <div class="container text-center">
            <h3>{{getUserSelectedName}} data</h3>
            <p class="text-break">{{getUserSelectedNameData.data}}</p>
            <p class="text-break">{{getUserSelectedNameData.url}}</p>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <div class="container text-center">
            <h3>Domains</h3>
            <p class="text-break" v-for="defName in getUserDefaultNames">{{defName}}</p>

            <hr>
            <p>
              <small><em>Don't see your domain here? Add it manually.</em></small>
            </p>
          </div>
        </div>
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
    ...mapGetters("user", ["getUserAddress", "getUserBalance", "getUserDefaultNames", "getUserSelectedName", "getUserSelectedNameData"]),
    ...mapGetters("network", ["getNetworkCurrency"]),
  },
}
</script>
