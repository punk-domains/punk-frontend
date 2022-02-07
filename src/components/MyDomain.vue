<template>
  <td>{{domain}}</td>
  <td>
    <span class="text-click">Edit domain data</span>
  </td>
  <td>
    <span v-if="getUserSelectedName === domain">
      <i class="bi bi-check2-circle"></i> Default
    </span>

    <span 
      v-else 
      class="text-click"
      @click="setAsMainName"
    >
      Set as main name
    </span>
  </td>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: "MyDomain",
  props: ["domain"],

  computed: {
    ...mapGetters("user", ["getUserSelectedName"]),
  },

  methods: {
    ...mapActions("user", ["fetchSelectedNameData"]),

    ...mapMutations("user", ["setSelectedName"]),

    setAsMainName() {
      console.log("Main name: " + this.domain);
      this.setSelectedName(this.domain);
      this.fetchSelectedNameData();
    }
  }
}
</script>

<style scoped>
.text-click:hover {
  color: white;
  text-decoration: underline;
  cursor: pointer;
}
</style>