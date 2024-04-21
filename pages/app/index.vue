<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <div class="container py-4">
    <h1 class="h1 fw-max text-center">Dashboard</h1>
    <div class="app-grid gap-4 my-4">
      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">Finances</h5>
          <p class="card-text">Open the finances manager product.</p>
          <div class="text-end">
            <NuxtLink class="btn btn-primary" to="/app/finances">Launch Finances →</NuxtLink>
          </div>
        </div>
      </div>

      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">Investments</h5>
          <p class="card-text">Open the investments manager product.</p>
          <div class="text-end">
            <NuxtLink class="btn btn-primary" to="/app/investments">Launch Investments →</NuxtLink>
          </div>
        </div>
      </div>

      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">Settings</h5>
          <p class="card-text">Manage organizations and user access to MoonDust products.</p>
          <div class="text-end">
            <NuxtLink class="btn btn-primary" to="/app/settings">Manage Settings →</NuxtLink>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>
