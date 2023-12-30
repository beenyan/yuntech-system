<script setup lang="ts">
defineProps({
  label: {
    type: String,
  },
  items: {
    type: Array<{ title: string; value: number | string }>,
  },
  loading: {
    default: true,
  },
  modelValue: {},
});

defineEmits(['update:model-value']);
</script>

<template>
  <v-select
    chips
    clearable
    density="comfortable"
    hide-details="auto"
    :label="label"
    :items="items"
    :loading="loading && items?.length === 0"
    item-value="value"
    variant="solo-filled"
    v-bind:model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  ></v-select>
</template>
