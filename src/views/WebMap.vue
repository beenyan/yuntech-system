<script setup lang="ts">
import { ref, onMounted } from 'vue';
import router from '../router.js';

const mapList = ref([
  {
    title: '選課系統',
    icon: 'selection-search',
    href: '/courseRegister',
  },
  {
    title: '搶課系統',
    icon: 'flash',
    href: '/courseHooker',
    disable: true,
  },
]);

onMounted(() => {});
</script>

<template>
  <v-container>
    <v-row justify="center" class="text-center mt-5">
      <v-col cols="12" md="6" lg="4" v-for="map in mapList">
        <v-btn
          color="green"
          :disabled="map.disable"
          :prepend-icon="`mdi-${map.icon}`"
          rounded="lg"
          size="x-large"
          @click="router.replace({ path: map.href })"
          stacked
        >
          {{ map.title }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
