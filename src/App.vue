<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content ? `${content} | Punk Domains` : `Punk Domains` }}</template>
  </metainfo>

  <Navbar />

  <div class="main-container">
    <router-view></router-view>

    <Footer />
  </div>
  
  <vdapp-board />
</template>

<script lang="ts">
import { onMounted } from "vue";
import { ethers } from 'ethers';
import { useEthers, useWallet } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import tldsJson from './abi/tlds.json';
import tldAbi from './abi/PunkTLD.json';
import { useMeta } from 'vue-meta';

export default {
  components: {
    Navbar,
    Footer
  },

  created() {
    this.fetchReferrer();

    // reset localstorage
    const v2 = localStorage.getItem("punkv2");

    if (!v2) {
      localStorage.clear();
      localStorage.setItem("connected", "null");
      localStorage.setItem("punkv2", "true");
    }
  },

  computed: {
    ...mapGetters("user", ["getUserSelectedName"]),
    ...mapGetters("network", ["getFallbackProvider"]),
  },

  methods: {
    ...mapActions("punk", ["fetchTlds"]),
    ...mapActions("user", ["fetchUserDomainNames"]),

    ...mapMutations("user", ["setUserData"]),
    ...mapMutations("network", ["setNetworkData"]),

    fetchAllData() {
      this.setUserData();
      this.setNetworkData();
      this.fetchTlds();
    },

    async fetchReferrer() {
      // check if any referral is present: ?ref=...
      const urlParams = new URLSearchParams(window.location.search);
      const referral = urlParams.get('ref');

      // check if domain name or address in the ref field
      if (referral && referral.split(".").length === 2) { // likely a domain name
        // split referral into two (domain name and TLD)
        const domArr = referral.split(".");

        for (let netId in tldsJson) { // iterate through different chains
          if (tldsJson[netId]["."+domArr[1]]) { // find the correct TLD
            // get fallback provider based on network ID
            const fProvider = this.getFallbackProvider(Number(netId));
            // create TLD contract (only new ABIs)
            const intfc = new ethers.utils.Interface(tldAbi);
            const refContract = new ethers.Contract(tldsJson[netId]["."+domArr[1]], intfc, fProvider);
            // fetch domain holder
            const refDomainHolder = await refContract.getDomainHolder(domArr[0]);

            if (refDomainHolder !== ethers.constants.AddressZero) {
              localStorage.setItem("referral", refDomainHolder); // store referral address in local storafe
            }
            break;
          }
        }
      } else if (referral && ethers.utils.isAddress(referral)) { // valid address
        // the last found referral is considered
        localStorage.setItem("referral", referral); // store referral address in local storafe
      }
    }
  },

  setup() {
    const { address, chainId, isActivated } = useEthers();
    const { connect } = useWallet();

    useMeta({
      title: 'Permissionless Web3 Domains',
      description: "Punk Domains is a web3 name protocol that supports multiple domain extensions such as .wagmi, .op, .klima, .smol, .L2, .sgb, .fantom, and many others.",
      twitter: {
        title: "Punk Domains - Permissionless Web3 Domains",
        description: "Punk Domains is a web3 name protocol that supports multiple domain extensions such as .op, .wagmi, .klima, .smol, .L2, .sgb, .fantom, and many others.",
        image: "https://punk.domains/assets/cover.png"
      },
      og: {
        title : 'Punk Domains, Permissionless Web3 Domains',
        description : 'Punk Domains is a web3 name protocol that supports multiple domain extensions such as .L2, .op, .klima, .smol, .wagmi, .sgb, .fantom, and many others.',
        image : 'https://punk.domains/assets/cover.png'
      },
      htmlAttrs: { lang: 'en' }
    })

    onMounted(() => {
      // if user already connected via MetaMask before, connect them automatically on the next visit
      if (!isActivated.value && localStorage.getItem("connected") == "metamask") {
        connect("metamask");
      }
    })

    return {
      address, chainId, connect, isActivated
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal) {
        this.setUserData();
        this.fetchUserDomainNames(true);
      }
    },

    chainId(newVal, oldVal) {
      if (!this.isActivated && localStorage.getItem("connected") == "metamask") {
        this.connect("metamask");
      }

      if (this.chainId >= 1) {
        this.fetchAllData();
        this.fetchUserDomainNames(true);
      }
    },

    isActivated(newVal, oldVal) {
      if (!localStorage.getItem("connected") && localStorage.getItem("connected") !== "null") {
        // set this to auto-connect on next visit
        localStorage.setItem("connected", "metamask");
      }
    }
  },
}
</script>

<style scoped>
.main-container {
  padding: 20px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
