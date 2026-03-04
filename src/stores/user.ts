// src/stores/user.ts
import { getUserInfo, login, logout } from '@/api/modules/user'
import type { UserInfo } from '@/api/user/types'
import { defineStore } from 'pinia'

interface UserState {
  token: string
  userInfo: UserInfo
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: {} as UserInfo,
    permissions: [],
  }),

  getters: {
    // 是否已登录
    isLogged: (state) => !!state.token,

    // 用户角色
    roles: (state) => state.userInfo?.roles || [],

    // 是否有特定权限
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission)
    },
  },

  actions: {
    // 登录
    async login(loginForm: { username: string; password: string }) {
      try {
        const res = await login(loginForm)
        this.token = res.token
        this.userInfo = res.userInfo
        this.permissions = res.userInfo.permissions || []

        // 保存到本地存储
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))

        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res
        this.permissions = res.permissions || []

        // 更新本地存储
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))

        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    async logout() {
      try {
        await logout()
        this.resetState()
        return Promise.resolve()
      } catch (error) {
        this.resetState()
        return Promise.reject(error)
      }
    },

    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = {} as UserInfo
      this.permissions = []

      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    // 更新用户信息
    updateUserInfo(info: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
  },
})
