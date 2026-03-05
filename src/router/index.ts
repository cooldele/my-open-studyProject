// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { CONTENT_ROUTE } from './content'
import { setupRouterGuard } from './guard'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
  CONTENT_ROUTE,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
setupRouterGuard(router)

export default router
