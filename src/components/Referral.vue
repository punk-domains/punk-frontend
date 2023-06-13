<template>
  <div class="row">
    <div class="col-md-12 mt-3">
      <div class="container text-center">
        <h3>Referrals</h3>

        <p> 
          Share this referral link and earn rewards from new domain mints!
        </p>

        <div class="row mt-1">
          <div class="col-md-6 offset-md-3">
            <input 
              class="form-control text-center clipboard"
              :value="urlOrigin + '/#/'+getUrlPath+'?ref=' + this.getNameOrAddress"
              @click="copyToClipboard(urlOrigin + '/#/'+getUrlPath+'?ref=' + this.getNameOrAddress)"
              readonly
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useToast, TYPE } from "vue-toastification";

export default {
  name: "Referral",
  props: ["urlpath"],

  data() {
    return {
      urlOrigin: "",
    }
  },

  mounted() {
    this.urlOrigin = window.location.origin;
  },

  computed: {
    ...mapGetters("user", ["getUserAddress", "getUserSelectedName"]),
    
    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserAddress;
      }
    },

    getUrlPath() {
      if (this.urlpath) {
        return this.urlpath;
      } else {
        return "";
      }
    }
  },

  methods: {
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      this.toast("Referral link copied to your clipboard!", {type: TYPE.SUCCESS});
    }
  },

  setup() {
    const toast = useToast();

    return { toast }
  },
}
</script>

<style scoped>
.clipboard {
  cursor: pointer
}
</style>