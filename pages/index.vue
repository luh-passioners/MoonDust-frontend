<script setup lang="ts">
const token = useToken();
const isLoggedIn = computed(() => token.value !== null);
</script>


<template>
  <div class="px-4 py-5 my-5 text-center">
    <p class="fw-max d-inline-flex align-items-center justify-content-center bg-dark text-white rounded shadow px-4 my-4">
      <span style="font-size: 5rem; margin-left: -0.5rem;">🐈</span>
      <span style="font-size: 3.5rem;" class="ms-2">MoonDust</span>
    </p>
    <h1 class="h1 fw-max my-2">Invest, track, and protect your organization's finances.</h1>

    <div class="col-lg-6 mx-auto my-4">
      <p class="lead">MoonDust tracks where your money comes and goes, and builds you a tailored investment strategy to further grow your finances using generative AI and machine learning.</p>  

      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center my-4">
        <NuxtLink v-if="isLoggedIn" class="btn btn-outline-success btn-lg px-4" to="/app">Continue to dashboard</NuxtLink>
        <NuxtLink v-else to="/auth/signup" type="button" class="btn btn-primary btn-lg px-4">Get your organization started!</NuxtLink>
      </div>
    </div>
  </div>
</template>