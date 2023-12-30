<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getVersion } from '@tauri-apps/api/app';

const AppVersion = ref('');

onMounted(async () => {
  AppVersion.value = `v${await getVersion()}`;
});
</script>

<template>
  <v-footer app class="py-6 px-8">
    <v-row>
      <v-col>
        <span>BeenYan</span>
      </v-col>

      <v-col class="text-center"> </v-col>

      <v-col class="text-right">
        <span>{{ AppVersion }}</span>
      </v-col>
    </v-row>
  </v-footer>
</template>
