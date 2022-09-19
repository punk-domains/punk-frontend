<template>
  <td>
    <span>{{domain}}</span>
  </td>
  <td v-if="!isDeprecatedWeb3">
    <span 
      class="text-click" 
      @click="this.$router.push({name: 'DomainDetails', params: {domainChain: getChainId, tld: domain.split('.')[1], domainName: domain.split('.')[0]}})"
    >
      Edit domain data
    </span>
  </td>
  <td v-if="isDeprecatedWeb3">
    <span 
      class="text-click" 
      @click="this.$router.push({name: 'DeprecateWeb3'})"
    >
      ⚠️ Deprecated. Claim refund here.
    </span>
  </td>
  <td>
    <span 
      class="text-click" 
      @click="this.$router.push({name: 'TransferDomain', params: {tld: domain.split('.')[1], domainName: domain.split('.')[0]}})"
    >
      Transfer domain
    </span>
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
    ...mapGetters("network", ["getChainId"]),
    ...mapGetters("user", ["getUserSelectedName"]),

    isDeprecatedWeb3() {
      if (this.domain.endsWith(".web3")) {
        return true;
      } else {
        return false;
      }
    }
  },

  methods: {
    ...mapActions("user", ["fetchSelectedNameData"]),

    ...mapMutations("user", ["setSelectedName"]),

    setAsMainName() {
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