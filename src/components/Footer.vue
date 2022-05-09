<template>
  <div class="container-fluid text-center mt-3">
    <router-link v-if="isActivated && isNetworkSupported" to="/profile">Profile</router-link>
    
    <span v-if="isActivated && isNetworkSupported"> | </span>

    <router-link to="/about">About</router-link>
    
    <span> | </span>

    <router-link to="/how">How it works</router-link>
    
    <span> | </span>

    <router-link to="/partners/l2dao">L2DAO</router-link>
    
    <span> | </span>

    <router-link to="/browser">Browser extension</router-link>
    
    <!--
    <span> | </span>

    <router-link to="/partners/udpolygon">UD .polygon refund</router-link>
    -->

    <br />

    <a target="_blank" href="https://icons8.com/icon/f34LtRddK1jj/man">Man</a> 
    icon by <a target="_blank" href="https://icons8.com">Icons8</a>
  </div>

  <div class="container-fluid text-center">

    <a class="icons" href="http://docs.punk.domains" target="_blank"><i class="bi bi-journal-text"></i></a>

    <a class="icons" target="_blank" href="https://github.com/punk-domains"><i class="bi bi-github"></i></a>

    <a class="icons" target="_blank" href="https://discord.gg/8dSrwrAQeu"><i class="bi bi-discord"></i></a>

    <a class="icons" target="_blank" href="https://twitter.com/PunkDomains"><i class="bi bi-twitter"></i></a>

    <a class="icons" target="_blank" href="https://polygon.technology">
      <i class="polygon">
        <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#DBDFEA" />
          <path d="M66.6663 40.9337V53.0011C66.662 53.7537 66.4632 54.4922 66.0892 55.1445C65.7153 55.7968 65.1791 56.3405 64.533 56.7226L54.1163 62.7438C53.4712 63.1297 52.7341 63.3334 51.983 63.3334C51.2319 63.3334 50.4948 63.1297 49.8497 62.7438L39.433 56.7226C38.7869 56.3405 38.2507 55.7968 37.8768 55.1445C37.5029 54.4922 37.304 53.7537 37.2997 53.0011V49.6142L42.633 46.5075V52.3948L51.9663 57.8306L61.2997 52.3948V41.5483L51.9663 36.1125L30.0997 48.8239C29.4485 49.1921 28.7137 49.3856 27.9663 49.3856C27.2189 49.3856 26.4842 49.1921 25.833 48.8239L15.4163 42.7777C14.7802 42.3898 14.2543 41.844 13.8894 41.1929C13.5245 40.5418 13.3329 39.8074 13.333 39.0604V26.9929C13.3373 26.2404 13.5362 25.5019 13.9101 24.8496C14.2841 24.1973 14.8203 23.6535 15.4663 23.2715L25.883 17.2503C26.5295 16.8682 27.2661 16.6667 28.0163 16.6667C28.7666 16.6667 29.5032 16.8682 30.1497 17.2503L40.5663 23.2715C41.2124 23.6535 41.7486 24.1973 42.1225 24.8496C42.4965 25.5019 42.6953 26.2404 42.6997 26.9929V30.3798L37.333 33.4657V27.6118L27.9997 22.176L18.6663 27.6118V38.4457L27.9997 43.8815L49.8663 31.1701C50.5175 30.8019 51.2523 30.6085 51.9997 30.6085C52.7471 30.6085 53.4818 30.8019 54.133 31.1701L64.5497 37.2164C65.192 37.6002 65.7245 38.1442 66.0954 38.7955C66.4663 39.4469 66.663 40.1835 66.6663 40.9337Z" fill="#7B3FE4" />
        </svg>
      </i>
    </a>
    
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

.icons {
  margin-left: 15px;
  margin-right: 15px;
  font-size: 2em;
}

.polygon {
  vertical-align: text-bottom;
  width: 40px;
}

.polygon svg circle {
  fill: #DBDFEA;
}

.polygon:hover svg circle {
  fill: white;
}
</style>