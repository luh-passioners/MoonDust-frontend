<script setup lang="ts">
const props = defineProps<{
  position: IPosition;
  current: number;
  name: string;
}>();

const gain = computed(() => props.position.shares * (props.current - props.position.initialPrice));
const displayDate = computed(() => {
  const [yyyy, mm, dd] = props.position.startDate.split("-");
  return `${mm}/${dd}/${yyyy}`;
});
</script>

<template>
  <details class="p-2 px-3 border rounded my-3" :class="[gain >= 0 ? 'border-success' : 'border-danger']">
    <summary class="data-row">
      <div>
        <p class="h6 my-0">{{ name }}</p>
      </div>
      <b class="h4 my-0">{{ gain >= 0 ? "+" : "-" }}${{ Math.abs(gain).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) }}</b>
    </summary>

    <hr class="my-2">

    <div class="data-row">
      <p>Date invested</p>
      <b>{{ displayDate }}</b>
    </div>
    <div class="data-row">
      <p>Shares bought</p>
      <b>{{ props.position.shares }}</b>
    </div>
    <div class="data-row">
      <p>Initial share price</p>
      <b>${{ props.position.initialPrice }}</b>
    </div>
    <div class="data-row">
      <p>Current share price</p>
      <b>${{ current }}</b>
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