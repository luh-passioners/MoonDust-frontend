<template>
  <div class="container py-4">
    <h1 class="h1 font-weight-max text-center">Dashboard</h1>
    <div class="app-group gap-4 my-4">
      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">Finances</h5>
          <p class="card-text">Open the finances manager product.</p>
          <NuxtLink class="btn btn-primary" to="/app/finances">Launch Finances</NuxtLink>
        </div>
      </div>

      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">Investments</h5>
          <p class="card-text">Open the investments manager product.</p>
          <NuxtLink class="btn btn-primary" to="/app/investments">Launch Investments</NuxtLink>
        </div>
      </div>

      <div class="card bg-body-tertiary">
        <div class="card-body">
          <h5 class="card-title">User Management</h5>
          <p class="card-text">Add and manage user access to FMS products.</p>
          <NuxtLink class="btn btn-primary" to="/app/users">Manage Users</NuxtLink>
        </div>
      </div>
    </div>
    </div>
</template>

<style scoped>
.app-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>