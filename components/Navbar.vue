<script setup lang="ts">
const token = useToken();
const isLoggedIn = computed(() => token.value !== null);
const user = useUser();
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary p-3">
    <div class="container-fluid">
      <NuxtLink class="navbar-brand" to="/">🐈 <b class="fw-max">FMS</b></NuxtLink>

      <div class="ms-auto d-flex align-items-center gap-2" v-if="isLoggedIn">
        <span>
          <b>{{ user?.name }}</b> @ {{ user?.company }}
        </span>
        <NuxtLink to="/auth/signup" class="btn btn-dark">Dashboard</NuxtLink>
        <button class="btn btn-danger">Logout</button>
      </div>
      <div class="ms-auto d-flex gap-2" v-else>
        <NuxtLink to="/auth/signup" class="btn btn-primary">Signup</NuxtLink>
        <NuxtLink to="/auth/login" class="btn btn-outline-success">Login</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style>
nav {
  box-shadow: 0 0 25px rgba(13, 22, 34, 0.5);
}
</style>