<!-- views/error/404.vue -->
<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-message">抱歉，页面走丢了~</div>
      <div class="error-desc">您访问的页面不存在或已被删除</div>

      <div class="error-actions">
        <el-button type="primary" @click="handleGoBack">
          <el-icon><ArrowLeft /></el-icon> 返回上一页
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon> 返回首页
        </el-button>
      </div>

      <div class="error-search">
        <el-input
          v-model="searchText"
          placeholder="搜索页面或内容"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="quick-links">
        <h3>快速导航</h3>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6" v-for="link in quickLinks" :key="link.path">
            <router-link :to="link.path" class="quick-link">
              <el-icon :size="24"><component :is="link.icon" /></el-icon>
              <span>{{ link.title }}</span>
            </router-link>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  DataBoard,
  HomeFilled,
  Monitor,
  Search,
  Setting,
  User,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchText = ref('')

// 快速链接
const quickLinks = [
  { path: '/', title: '仪表盘', icon: DataBoard },
  { path: '/user', title: '用户管理', icon: User },
  { path: '/system', title: '系统设置', icon: Setting },
  { path: '/monitor', title: '系统监控', icon: Monitor },
]

// 返回上一页
const handleGoBack = () => {
  router.back()
}

// 返回首页
const handleGoHome = () => {
  router.push('/')
}

// 搜索
const handleSearch = () => {
  if (searchText.value.trim()) {
    ElMessage.info(`搜索: ${searchText.value}`)
    // 这里可以跳转到搜索结果页
  } else {
    ElMessage.warning('请输入搜索内容')
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;

  .error-content {
    text-align: center;
    max-width: 600px;
  }

  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: #409eff;
    line-height: 1;
    margin-bottom: 20px;
  }

  .error-message {
    font-size: 24px;
    color: #303133;
    margin-bottom: 10px;
  }

  .error-desc {
    font-size: 16px;
    color: #606266;
    margin-bottom: 40px;
  }

  .error-actions {
    margin-bottom: 40px;

    .el-button {
      margin: 0 10px;
      padding: 10px 24px;
      font-size: 16px;
    }
  }

  .error-search {
    margin-bottom: 40px;

    .search-input {
      max-width: 400px;
      margin: 0 auto;
    }
  }

  .quick-links {
    h3 {
      font-size: 18px;
      color: #303133;
      margin-bottom: 20px;
    }

    .quick-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      text-decoration: none;
      color: #606266;
      transition: all 0.3s;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.15);
        color: #409eff;
      }

      .el-icon {
        margin-bottom: 10px;
        color: inherit;
      }

      span {
        font-size: 14px;
      }
    }
  }
}
</style>
