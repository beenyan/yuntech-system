<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getName } from '@tauri-apps/api/app';
import { useCookiesStore } from '../stores/Cookies.js';
import router from '../router.js';

const cookieManger = useCookiesStore();

const appName = ref('');

const logout = async () => {
  cookieManger.clearCookies();
  router.replace({ path: '/login' });
};

onMounted(async () => {
  appName.value = await getName();
});
</script>

<template>
  <v-app-bar class="px-5">
    <template v-slot:prepend>
      <v-btn icon="mdi-home" @click="router.replace({ path: '/' })">
        <v-icon></v-icon>
        <v-tooltip activator="parent" location="bottom">首頁</v-tooltip>
      </v-btn>
    </template>

    <template v-slot:title>
      <v-app-bar-title>雲科系統</v-app-bar-title>
    </template>

    <template v-slot:append>
      <v-btn icon="mdi-logout" @click="logout">
        <v-icon></v-icon>
        <v-tooltip activator="parent" location="bottom">登出</v-tooltip>
      </v-btn>
    </template>
  </v-app-bar>
</template>
