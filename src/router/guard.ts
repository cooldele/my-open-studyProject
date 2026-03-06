// src/router/guard.ts
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import type { Router } from 'vue-router'

// 白名单路由，不需要登录即可访问
const whiteList = ['/login', '/404']

export function setupRouterGuard(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // 显示页面加载进度条
    NProgress.start()

    // 判断是否有 token
    const hasToken = userStore.token || localStorage.getItem('token')

    if (hasToken) {
      // 已登录
      if (to.path === '/login') {
        // 如果访问登录页，重定向到首页
        next({ path: '/' })
        NProgress.done()
      } else {
        // 检查用户信息是否存在
        if (!userStore.userInfo.id) {
          try {
            // 获取用户信息
            await userStore.getUserInfo()
            next()
          } catch (error) {
            // 获取用户信息失败，清除 token 并跳转到登录页
            userStore.logout()
            ElMessage.error('登录已过期，请重新登录')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        } else {
          next()
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接访问
        next()
      } else {
        // 不在白名单，重定向到登录页
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  // 后置守卫
  router.afterEach(() => {
    // 完成页面加载进度条
    NProgress.done()
  })

  // 错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
  })
}
