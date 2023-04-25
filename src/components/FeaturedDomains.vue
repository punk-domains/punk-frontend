<template>
  <div class="container text-center">
    <h3>Featured domains</h3>

    <div class="row mt-4">

      <div class="col-2 mb-3">
        <a target="_blank" href="https://smol.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .smol
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://id.zkchat.net">
          <div class="container text-center">
            <p class="text-break mt-3">
              .zksoul
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://names.pooly.me">
          <div class="container text-center">
            <p class="text-break mt-3">
              .pool
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://optimistic.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .op
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://songbird.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .sgb
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <router-link tag="a" to="/partners/l2dao">
          <div class="container text-center">
            <p class="text-break mt-3">
              .L2
            </p>
          </div>
        </router-link>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://flr.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .flr
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://giveth.punk.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .giveth
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://fantomnames.org">
          <div class="container text-center">
            <p class="text-break mt-3">
              .fantom
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://ppl.domains">
          <div class="container text-center">
            <p class="text-break mt-3">
              .ppl
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <a target="_blank" href="https://www.kns.earth">
          <div class="container text-center">
            <p class="text-break mt-3">
              .klima
            </p>
          </div>
        </a>
      </div>

      <div class="col-2">
        <router-link tag="a" to="/partners/huwa">
          <div class="container text-center">
            <p class="text-break mt-3">
              .huwa
            </p>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturedDomains'
}
</script>

<style scoped>
a {
  text-decoration: none;
  font-size: 1.2em;
}

a:active {
  transform: scale(0.8);
}

a:hover {
  border-color: white;
  opacity: 0.8;
  font-size: 1.4em;
}
</style>