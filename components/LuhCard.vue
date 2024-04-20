<script setup lang="ts">
const props = defineProps<{
  title: string;
  text: string;
}>();
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">{{ props.title }}</h5>
      <p class="card-text">{{ props.text }}</p>
      <slot />
    </div>
  </div>
</template>