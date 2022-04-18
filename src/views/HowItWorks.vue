<template>
<div class="container">
  <h1 class="text-center">How it works</h1>

  <div class="row mt-3">
    <div class="col-md-8 offset-md-2">
      
      <h3>TLD Factories</h3>
      <p>
      Each factory has a TLD template that defines its operation logic. Currently, there's only one factory contract which allows for one-time TLD and domain purchases.
      </p>
      <p>
      This means that these domains never expire (holders can hold them forever).
      </p>
      <h3>Restricted TLD names</h3>
      <p>
      TLD factories need to communicate in order to avoid TLD collision (meaning two factories producing the same TLD). 
      </p>
      <p>
      In order to prevent collisions, there's a contract called PunkForbiddenTlds which has a list of already used or restricted TLD names (.eth is an example of a forbidden TLD name, because it's used in ENS).
      </p>
      <h3>TLD contracts</h3>
      <p>
      A TLD is minted from a TLD Factory. The TLD owner can set domain prices and can stop domain sales.
      </p> 
      <p>
        <ul>
          <li>Example of a TLD:  <strong>.klima</strong></li>
          <li>Example of a domain:  <strong>timmy.klima</strong></li>
        </ul>
      </p>
      <p>
      The TLD owner cannot confiscate domain from its holder, just like Factory owner cannot confiscate a TLD from its owner. Factory owner can only set a royalty in the TLD contract and nothing else.
      </p>

      <h3>Domains</h3>
      <p>
      A domain can only be held by one address, but one address can hold many domains.
      </p> 
      <p>A domain can hold many pieces of data: 
        <ul>
          <li>The holder's address (by default)</li>
          <li>Profile picture (an NFT that the user owns)</li>
          <li>URL (like user's homepage or similar; this comes handy together with the Klima Domains browser plugin)</li>
          <li>Custom data such as a Twitter handle, description, etc.</li>
        </ul>
      </p>  
      <p>
        Each domain is an ERC-721 NFT and can be sold on NFT marketplaces. 
      </p>
      <h3>Auto Retiring Domain</h3>
      <img class="img-fluid mb-4" src="../assets/kns-contracts-schema.png" width="800" />
      <p>For more info <router-link to="/about">click here</router-link>.</p>



    </div>
  </div>
</div>
</template>

<script lang="ts">
  export default {
    name: "HowItWorks"
  }
</script>

<style scoped>
p {
  text-align: justify;
  font-size: 1.1em;
}

h3 {
  margin-top: 35px;
  margin-bottom: 25px;
}
</style>