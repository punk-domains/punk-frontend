<template>
  <div class="container">

    <img src="https://news.artnet.com/app/news-upload/2021/08/Yuga-Labs-Bored-Ape-Yacht-Club-7940.jpg" class="img-fluid img-thumbnail">

    <h3 class="text-center mt-2 text-break">
      techie.web3
    </h3>

    <hr />

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-person"></i> Profile
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-send"></i> Send tokens
    </router-link>
    
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-arrow-repeat"></i> Swap tokens
    </router-link>
    
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-piggy-bank"></i> Lend tokens
    </router-link>
    
    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-trophy"></i> Win tokens
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <i class="bi bi-tree"></i> Help environment
    </router-link>

  </div>
</template>

<script>
  export default {
    name: "Sidebar"
  }
</script>

<style scoped>
.bi {
  margin-right: 5px;
}

.btn-sidebar, .btn-sidebar:focus {
  padding: 10px;
  width: 100%;
  color: #DBDFEA;
  text-decoration: none;
  box-shadow: none;
}

.btn-sidebar:hover {
  color: #DBDFEA;
  background-color: #1D1E2C;
  border-radius: 10px;
}
</style>