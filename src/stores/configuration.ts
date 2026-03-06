import { defineStore } from 'pinia'

export const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    // 侧边栏是否折叠
    sidebarCollapsed: false as boolean,
  }),
  getters: {
    // 方便模板读取
    isSidebarCollapsed: (state) => state.sidebarCollapsed,
  },
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarCollapsed(val: boolean) {
      this.sidebarCollapsed = val
    },
  },
})
