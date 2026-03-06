<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    :collapse="props.isCollapse"
    :collapse-transition="false"
    router
    @open="handleOpen"
    @close="handleClose"
    @select="handleSelect"
  >
    <!-- 静态菜单可以保留，或者全部用动态生成 -->
    <template v-for="menu in menus" :key="menu.name">
      <!-- 如果有子菜单 -->
      <el-sub-menu v-if="hasChildren(menu)" :index="menu.path">
        <!-- 改为 menu.path，确保 index 与路由路径匹配 -->
        <template #title>
          <el-icon v-if="menu.meta?.icon">
            <component :is="getIcon(menu.meta.icon)" />
          </el-icon>
          <span>{{ menu.meta?.title || menu.name }}</span>
        </template>

        <el-menu-item
          v-for="child in menu?.children"
          :key="child.name"
          :index="`${menu.path}/${child.path}`"
        >
          <el-icon v-if="child.meta?.icon">
            <component :is="getIcon(child.meta.icon)" />
          </el-icon>
          <span>{{ child.meta?.title || child.name }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 没有子菜单的直接显示 -->
      <el-menu-item v-else :index="menu.path">
        <el-icon v-if="menu.meta?.icon">
          <component :is="getIcon(menu.meta.icon)" />
        </el-icon>
        <template #title>{{ menu.meta?.title || menu.name }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script lang="ts" setup>
import { CONTENT_ROUTE } from '@/router/content'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()

// 当前激活的菜单（动态计算当前路由路径）
const activeMenu = computed(() => route.path)

// 获取菜单列表
const menus = computed(() => CONTENT_ROUTE.children || [])

const hasChildren = (menu: any): boolean => {
  return !!(menu.children && menu.children.length > 0)
}

// 动态获取图标组件
const getIcon = (iconName: string) => {
  return ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue]
}

const handleOpen = (key: string, keyPath: string[]) => {
  console.log('打开子菜单:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log('关闭子菜单:', key, keyPath)
}

// 新增：处理菜单选择事件（可选，用于自定义路由跳转或日志）
const handleSelect = (key: string, keyPath: string[]) => {
  console.log('选择菜单:', key, keyPath)
  // 如果 router 属性不够用，可以手动跳转：router.push(key)
}
onMounted(() => {
  console.log('菜单组件已挂载，当前路由:', route.path)
})
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: 100%;
}

/* 菜单项样式 */
.el-menu-vertical-demo .el-menu-item,
.el-menu-vertical-demo .el-sub-menu__title {
  transition: all 0.3s ease;
}

/* 折叠时的样式优化 */
.el-menu-vertical-demo.el-menu--collapse {
  width: 100%;
}

.el-menu-vertical-demo.el-menu--collapse .el-menu-item,
.el-menu-vertical-demo.el-menu--collapse .el-sub-menu__title {
  padding: 0 !important;
  display: flex;
  justify-content: center;
}

/* 选中状态的样式（可选，增强高亮效果） */
.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: #409eff !important; /* 自定义选中背景色 */
  color: #fff !important;
}
</style>
