<template>
  <div class="text-center">
    <div class="text-primary-600 text-9xl font-bold my-5">404</div>
    <div class="text-2xl text-gray-500 my-5">Oops. Page not found...</div>
    <div class="flex flex-row justify-center space-x-4">
      <button @click="this.$router.go(-1)" class="btn btn-primary my-5 mx-2">Back</button>
      <button @click="this.$router.push({name: 'Home'})" class="btn btn-primary my-5">Home</button>
    </div>
  </div>
</template>
