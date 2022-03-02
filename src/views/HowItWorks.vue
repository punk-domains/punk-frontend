<template>
<div class="container">
  <h1 class="text-center">How it works</h1>

  <div class="row mt-3">
    <div class="col-md-8 offset-md-2">
      <p>
        Let's take a more technical overview of Punk Domains. The main Punk Domains engines are TLD 
        <strong>Factory</strong> contracts.
      </p>

      <p class="text-center">
        <img class="img-fluid" src="../assets/architecture.png" />
      </p>

      <h3>TLD Factories</h3>

      <p>
        Each factory has a TLD template that defines its business logic. Currently, there's only one factory contract 
        which allows for one-time TLD and domain purchases. This means that these domains never expire (holders can 
        hold them forever).
      </p>

      <p>
        In the future, new TLD factories will be added, each with a different business logic and each with its own 
        mix of one-time and/or renewable TLDs/domains rules (and perhaps new business models that we haven't thought yet about).
      </p>

      <h3>Restricted TLD names</h3>

      <p>
        TLD factories need to communicate in order to avoid TLD collision (meaning two factories producing the 
        same TLD).
      </p>

      <p>
        In order to prevent collisions, there's a contract called <code>PunkForbiddenTlds</code>, which has a list of already 
        used or restricted TLD names (<code>.eth</code> is an example of a forbidden TLD name, because it's used in ENS).
      </p>

      <h3>TLD contracts</h3>

      <p>
        A TLD needs to be purchased (minted) from a TLD Factory for a certain price. There 
        needs to be a (high enough) price to avoid spamming and squatting.
      </p>

      <p>(Note that a TLD Factory can temporarily restrict new TLD mints to the factory owner only.)</p>

      <p>
        A TLD contract can be owned by anyone. The TLD owner can set domain prices and can stop domain sales 
        anytime they want.
      </p>

      <p>
        <ul>
          <li>Example of a TLD: <code>.web3</code></li>
          <li>Example of a domain: <code>techie.web3</code></li>
        </ul>
      </p>

      <p>
        The factory owner can set a royalty for each domain purchase, but the royalty can never exceed 50% of the 
        domain price (in reallity it will be much lower).
      </p>

      <p>
        The TLD owner cannot confiscate domain from its holder, just like Factory owner cannot confiscate a TLD 
        from its owner. Factory owner can only set a royalty in the TLD contract and nothing else.
      </p>

      <h3>Domains</h3>

      <p>A domain can only be held by one address, but one address can hold many domains.</p>

      <p>
        A domain can hold many pieces of data:
        <ul>
          <li>The holder's address (by default).</li>
          <li>Profile picture (an NFT that the user owns).</li>
          <li>
            URL (like user's homepage or similar; this comes handy together with the Punk Domains browser 
            plugin).
          </li>
          <li>Custom data such as a Twitter handle, description, etc.</li>
        </ul>
      </p>

      <p>
        Each domain is an ERC-721 NFT and can be sold on NFT marketplaces.
      </p>

      <h3>Resources</h3>

      <p>
        <ul>
          <li><a target="_blank" href="http://docs.punk.domains">Docs</a></li>
          <li><a target="_blank" href="https://github.com/punk-domains">GitHub</a></li>
          <li><a target="_blank" href="https://discord.gg/8dSrwrAQeu">Discord</a></li>
          <li><a target="_blank" href="https://twitter.com/PunkDomains">Twitter</a></li>
        </ul>
      </p>
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
}
</style>