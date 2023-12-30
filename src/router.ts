import { createRouter, createWebHistory } from 'vue-router';

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/WebMap.vue'),
    },
    {
      path: '/login',
      component: () => import('./views/Login.vue'),
    },
    {
      path: '/courseRegister',
      component: () => import('./views/CourseRegister.vue'),
    },
    {
      path: '/courseHooker',
      component: () => import('./views/CourseHooker.vue'),
    },
  ],
});
