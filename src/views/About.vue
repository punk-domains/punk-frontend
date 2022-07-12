<template>
<div class="container">
  <h1 class="text-center">About Punk Domains</h1>
  
  <div class="row mt-3">
    <div class="col-md-8 offset-md-2">
      <p>
        Punk Domains allows you to <strong>register a domain name</strong> attached to your account address.
      </p>

      <h3>Why would anyone need that?</h3>

      <p>
        Well, your crypto address is hard to remember. It starts with <code>0x</code>, but then continues with 40 random 
        characters (digits from <code>0</code> to <code>9</code> and letters from <code>a</code> to <code>f</code>).
      </p>

      <p>
        If you want someone to send you tokens, sure you could send them your address and they could copy-paste it 
        into their wallet. But wouldn't it be great if they could just enter a domain name, like 
        <code>techie.wagmi</code>, instead of the whole address?
      </p>
        
      <p>
        This is what they can do on <code>punk.domains</code> (on the Send Tokens page).
      </p>

      <p>
        Another usecase is to have a domain name as your <strong>username</strong> in various web3 dApps, games and 
        upcoming social networks. Instead of your username being <code>0xb29…45D</code>, it could be 
        <code>techie.wagmi</code>.
      </p>

      <p>
        An additional feature that Punk Domains provide is a <strong>browser extension</strong> that takes you to a designated URL 
        address if you type a domain name into browser URL bar.
      </p>

      <h3>But isn't all that what ENS is doing already?</h3>

      <p>
        Yes, but they only do it on Ethereum L1 and (for now) only with <code>.eth</code>. Punk Domains allows 
        many different top-level domains (TLDs), such as <code>.wagmi</code>, <code>.ape</code>, 
        <code>.opti</code> etc. And it runs on L2 chains.
      </p>

      <p>
        Punk Domains enables anyone to create a TLD, operate it and earn revenue from it. For example, a DeFi protocol 
        like Aave could create a TLD named <code>.aave</code>, and the revenue from each purchase would go to 
         Aave treasury.
      </p>

      <p>
        Punk Domains architecture is <strong>very flexible</strong> and it allows for various domain business 
        models. The first one is a one-time domain purchase (no renewals), but new ones will be added in the 
        future (like time-restricted domain ownership).
      </p>

      <h3>Not just about domains</h3>

      <p>
        Punk Domains is not just about domains (in the web2 sense of the word). It's about <strong>identity</strong> 
        in the web3 world. Domain name gives you a digital identity, and data attached to this identity strengthen it. 
      </p>

      <p>
        Another thing that Punk Domains cherishes is <strong>full decentralization</strong>. The contracts are 
        non-upgradable and don't need any keepers (or similar outside software) to properly operate. The only 
        thing not decentralized yet is the main factory contract ownership (the one that decides a new TLD price) 
        - but stay tuned... 😉
      </p>

      <hr>

      <p>
        <em>
          (If you want a more technical overview on how Punk Domains works, <router-link to="/how">click here</router-link>.)
        </em>
      </p>

      <p>
        Punk Domains protocol is proudly serving the following DAOs and communities:
        <ul>
          <li>Layer2DAO: .L2 domain</li>
          <li>KlimaDAO: <a href="https://www.kns.earth" target="_blank">.klima domain</a></li>
          <li>Smol Brains NFT community: <a href="https://smol.domains" target="_blank">.smol domain</a></li>
        </ul>
      </p>

      

    </div>
  </div>
</div>
</template>

<script lang="ts">
  export default {
    name: "About"
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