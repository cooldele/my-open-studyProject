export const CONTENT_ROUTE = {
  path: '/',
  component: () => import('@/layouts/default.vue'),
  meta: { requiresAuth: true },
  redirect: '/dashboard',
  children: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      meta: {
        title: '今日任务',
        icon: 'Calendar', // 使用字符串形式的图标名
      },
      component: () => import('@/views/dashboard/index.vue'),
    },
    {
      name: 'user',
      path: '/user',
      meta: {
        title: '用户信息',
        icon: 'User',
      },
      component: () => import('@/views/user/index.vue'),
    },
    {
      name: 'Assets',
      path: '/assets',
      meta: {
        title: '资产信息',
        icon: 'ChatLineRound',
      },
      component: () => import('@/views/assets/index.vue'),
    },
    {
      name: 'Message',
      path: '/message',
      meta: {
        title: '消息中心',
        icon: 'Message',
      },
      component: () => import('@/views/message/index.vue'),
    },
  ],
}
