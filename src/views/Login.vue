<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useYuntechStore } from '../stores/Yuntech.js';
import router from '../router.js';

const yuntechManager = useYuntechStore();
const username = ref(localStorage.getItem('username') ?? '');
const password = ref(localStorage.getItem('password') ?? '');

const login = async () => {
  const data = await yuntechManager.login(username.value, password.value);

  if (data) {
    router.replace({ path: '/' });
  }
};

onMounted(() => {
  yuntechManager.checkLogin(false);
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-8 mt-12">
          <v-card-title> 登入系統 </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="username" label="帳號" outlined required a :rules="[(v) => !!v || '帳號不能為空']"></v-text-field>

              <v-text-field v-model="password" label="密碼" type="password" outlined required :rules="[(v) => !!v || '密碼不能為空']"></v-text-field>

              <v-btn type="submit" color="primary">登入</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
