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
              :value="'https://punk.domains/?ref=' + this.getNameOrAddress"
              @click="copyToClipboard('https://punk.domains/?ref=' + this.getNameOrAddress)"
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

  computed: {
    ...mapGetters("user", ["getUserAddress", "getUserSelectedName"]),
    
    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserAddress;
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