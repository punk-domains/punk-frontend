<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      
      <MyTlds />
      
    </div>

  </div>

</template>

<script lang="ts">
import MyTlds from '../components/MyTlds.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "Tlds",

  components: {
    MyTlds,
    Sidebar
  }
}
</script>

<style scoped>

</style>