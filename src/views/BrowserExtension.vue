<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div class="row">

        <div class="col-md-12 mb-3">
          <div class="container text-center">
            <h3>Browser Extension/Plugin</h3>

            <p class="text-wrap p-4">
              Punk Domains browser extension allows you to enter a .klima domain name in the URL bar and the 
              extension will redirect you to the URL that is set for that domain. If no URL is set, the extension 
              will redirect you to the domain page on the Klima Name Service website.
            </p>
          </div>
        </div>

      </div>

      <div class="row">

        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Chrome/Brave</h3>

            <p>
              <small><em>Coming soon!</em></small>
            </p>

            <img class="img-fluid browser-img mb-3" src="../assets/chrome-logo.png" />
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Firefox</h3>

            <p>
              <small><em>Coming soon!</em></small>
            </p>

            <img class="img-fluid browser-img mb-3" src="../assets/firefox-logo.png" />
          </div>
        </div>

      </div>

    </div>
  </div>

</template>

<script lang="ts">
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "BrowserExtension",

  components: {
    Sidebar
  }
}
</script>

<style scoped>
.browser-img {
  max-height: 200px;
}
</style>