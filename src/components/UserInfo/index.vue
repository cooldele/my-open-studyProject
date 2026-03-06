<!-- src/components/DashboardUserInfo.vue -->
<template>
  <div class="dashboard-user-info">
    <!-- 左侧：用户信息 -->
    <div class="user-profile justify-between">
      <div class="user-stats-row">
        <!-- 今日任务 -->
        <div class="stat-item" @click="handleTaskClick">
          <div class="stat-icon today-task">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.todayTasks || 5 }}</div>
            <div class="stat-label">今日任务</div>
          </div>
        </div>

        <!-- 未读消息 -->
        <div class="stat-item" @click="handleMessageClick">
          <div class="stat-icon unread-msg">
            <el-icon><ChatDotSquare /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.unreadMessages || 3 }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </div>

        <!-- 在线时长 -->
        <div class="stat-item" @click="handleOnlineTimeClick">
          <div class="stat-icon online-time">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ onlineTime }}</div>
            <div class="stat-label">在线时长</div>
          </div>
        </div>
      </div>

      <div class="user-details flex items-center">
        <el-avatar :size="50" :src="userAvatar" class="user-avatar">
          {{ userInfo.nickname?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="user-name-row">
          <span claas="user-name ml-5">
            {{ userInfo.nickname || '普通用户' }}-{{ userInfo.department }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
// 从 element-plus 图标库中导入几个存在的图标
import { ChatDotSquare, Clock, Document } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo || { nickname: '普通用户' })

// 用户头像
const userAvatar = computed(
  () =>
    userInfo.value.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
)

// 用户角色
const availableRoles = [
  { value: 'user', label: '普通用户' },
  { value: 'admin', label: '系统管理员' },
]

const selectedRole = ref('user')

// 用户统计数据
const userStats = ref({
  todayTasks: 5,
  unreadMessages: 3,
})

// 在线时长
const onlineTime = ref('0h0m')
let onlineTimer: number | null = null
let startTime = Date.now()

// 更新在线时长
const updateOnlineTime = () => {
  const now = Date.now()
  const diff = now - startTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  onlineTime.value = `${hours}h${minutes}m`
}

// 事件处理
const handleTaskClick = () => {
  console.log('点击今日任务')
}

const handleMessageClick = () => {
  console.log('点击未读消息')
}

const handleOnlineTimeClick = () => {
  console.log('点击在线时长')
}

onMounted(() => {
  startTime = Date.now()
  onlineTimer = setInterval(updateOnlineTime, 60000)
  updateOnlineTime()
})

onUnmounted(() => {
  if (onlineTimer) {
    clearInterval(onlineTimer)
  }
})
</script>

<style lang="scss" scoped>
.dashboard-user-info {
  width: 100%;
  background: white;
  padding: 0 20px;
  align-items: center;

  .user-profile {
    display: flex;
    height: 100%;
    align-items: center;

    .user-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
      border: 3px solid #f0f2f5;
    }

    .user-details {
      .user-name-row {
        display: flex;
        align-items: center;
        gap: 15px;

        .user-name {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        .role-select {
          width: 120px;

          :deep(.el-input__wrapper) {
            background: #f5f7fa;
            border: 1px solid #dcdfe6;
            box-shadow: none;

            .el-input__inner {
              color: #606266;
              font-size: 12px;
            }
          }

          :deep(.el-input__suffix) {
            .el-icon {
              color: #c0c4cc;
            }
          }
        }
      }
    }
    .user-stats-row {
      display: flex;
      gap: 40px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);

          .stat-icon {
            opacity: 0.9;
          }
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.today-task {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
            color: white;
          }

          &.unread-msg {
            background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
            color: white;
          }

          &.online-time {
            background: linear-gradient(135deg, #e6a23c 0%, #eebe77 100%);
            color: white;
          }

          .el-icon {
            font-size: 20px;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

// 下拉菜单样式
.role-dropdown {
  .el-select-dropdown__item {
    &.selected {
      color: #409eff;
    }
  }
}
</style>
