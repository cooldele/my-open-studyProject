<!-- src/layouts/default.vue -->
<template>
  <!-- Element Plus 的容器组件 -->
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside-container">
      <Sidebar />
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
import UserInfo from '@/components/UserInfo/index.vue'
// 组件逻辑
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  overflow: hidden;

  .aside-container {
    background: #304156;
    overflow-x: hidden;
  }

  .header-container {
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    padding: 0;
  }

  .main-container {
    padding: 20px;
    background: #f0f2f5;
    overflow: auto;
  }
}
</style>
