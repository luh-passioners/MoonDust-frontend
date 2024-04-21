<script setup lang="ts">
const props = defineProps<{
  transaction: ITransaction;
  org: IOrg;
}>();

const isGain = computed(() => props.transaction.amount >= 0);
</script>

<template>
  <details class="p-2 px-3 border rounded my-3" :class="[isGain ? 'border-success' : 'border-danger']">
    <summary class="data-row">
      <div>
        <p class="h6 my-0">{{ props.transaction.name }}</p>
        <small class="fst-italic">{{ props.transaction.date }}</small>
      </div>
      <b class="h4 my-0">{{ isGain ? "+" : "-" }}${{ Math.abs(transaction.amount).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) }}</b>
    </summary>

    <hr class="my-2">

    <div class="data-row">
      <p>Organization</p>
      <b>{{ props.org.name }}</b>
    </div>
  </details>
</template>

<style scoped>
.data-row {
  display: flex;
  grid-template-columns: 1fr 1fr;
  align-items: center;
}

.data-row p {
  margin: 0;
}

.app-grid b {
  margin-left: auto;
}
</style>