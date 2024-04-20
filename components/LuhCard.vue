<script setup lang="ts">
const props = defineProps<{
  title: string;
  text: string;
  headerBtn?: string;
}>();

const emit = defineEmits<{
  (e: "btnclick"): void;
}>();
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title d-flex align-items-start">
        {{ props.title }}
      </h5>
      <p class="card-text">{{ props.text }}</p>
      <slot />
    </div>
  </div>
</template>