<script setup lang="ts">
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
import { snackbar } from './modules/Utils.js';
</script>

<template>
  <v-app @contextmenu.prevent>
    <Header></Header>

    <div class="mb-16"></div>

    <router-view />

    <div class="my-16"></div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>

    <Footer></Footer>
  </v-app>
</template>
