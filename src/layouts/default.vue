<!-- src/layouts/default.vue -->
<template>
  <!-- Element Plus 的容器组件 -->
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-container flex flex-col">
      <el-row
        flex
        align="middle"
        :justify="isCollapse ? 'center' : 'space-between'"
        class="bg-[#304156] h-[40px] px-[20px]"
      >
        <span v-show="!isCollapse" class="text-6 text-white transition-all duration-200">
          管理系统
        </span>
        <el-icon style="font-size: 18px" @click.prevent="handleToggleCollapse">
          <component :is="isCollapse ? 'Fold' : 'Expand'" class="text-white" />
        </el-icon>
      </el-row>
      <MenuBar class="flex-1 transition-all duration-300" :isCollapse="isCollapse" />
    </el-aside>

    <!-- 主内容区容器 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header-container">
        <UserInfo />
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>

      <!-- 底部（可选） -->
      <!-- <el-footer>Footer</el-footer> -->
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import MenuBar from '@/components/MenuBar.vue'
import UserInfo from '@/components/UserInfo/index.vue'
import { useConfigurationStore } from '@/stores/configuration'
import { computed } from 'vue'

const config = useConfigurationStore()

const isCollapse = computed(() => config.isSidebarCollapsed || false)

const handleToggleCollapse = () => {
  config.toggleSidebar()
}
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  overflow: hidden;

  .aside-container {
    overflow-x: hidden;
    transition: width 0.3s ease; // 宽度过渡动画
  }

  .header-container {
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    padding: 0;
  }

  .main-container {
    padding: 20px;
    background: #f0f2f5;
    overflow: auto;
  }
}
</style>
