<template>
  <!-- 路由视图 -->
  <router-view> </router-view>
</template>

<script setup lang="ts">
// 自动导入的 API（无需手动导入）
// - Vue API: onMounted, ref, computed 等
// - Vue Router: useRoute, useRouter
// - Pinia: useUserStore 等

// 状态
const cachedViews = ref<string[]>([]) // 缓存的路由组件
const route = useRoute() // 自动导入

// 监听路由变化
watch(
  () => route.path,
  () => {
    // 添加页面到缓存
    if (route.name && !cachedViews.value.includes(route.name as string)) {
      cachedViews.value.push(route.name as string)
    }
  },
)

// 初始化
onMounted(() => {
  console.log('App initialized')
})
</script>

<style lang="scss">
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  color: #333;
  background-color: #f5f7fa;
}

/* 路由切换动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
