<script setup lang="ts">

</script>

<template>
  <div class="container py-4">
    <NuxtLink to="/app" class="d-inline-block link-underline link-underline-opacity-0 mb-2">← Return to Dashboard</NuxtLink>
    <h1 class="fw-max h1">Finances Manager</h1>

    <div class="my-4 app-grid">
      <LuhCard title="Recent Transactions" text="View and sort your incoming and outgoing transactions">
        <div class="gap-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
          <div>
            <small class="fw-bold">Type</small>
            <select class="form-select">
              <option value="All">All</option>
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
            </select>
          </div>
          <div>
            <small class="fw-bold">Organization</small>
            <select class="form-select">
              <option value="All">All</option>
              <option value="Twizz">Twizz Org</option>
            </select>
          </div>
          <div>
            <small class="fw-bold">Product</small>
            <select class="form-select">
              <option value="All">All</option>
              <option value="Spotify">Spotify</option>
              <option value="AWS">AWS</option>
            </select>
          </div>
        </div>
        <hr>

        <TransactionCard v-for="(t, i) of getTransactions()" :transaction="t" :key="i" />
      </LuhCard>
    </div>
  </div>
</template>

<style scoped>
.app-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>