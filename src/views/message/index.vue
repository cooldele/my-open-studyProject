<!-- src/views/messages/index.vue -->
<template>
  <div class="message-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">消息中心</h2>
        <span class="page-subtitle">共 {{ total }} 条消息，{{ unreadCount }} 条未读</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleMarkAllRead" :disabled="unreadCount === 0">
          <el-icon><Message /></el-icon> 全部标记已读
        </el-button>
        <el-button @click="handleSettings">
          <el-icon><Setting /></el-icon> 消息设置
        </el-button>
      </div>
    </div>

    <!-- 消息分类标签 -->
    <el-tabs v-model="activeTab" class="message-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部消息" name="all" />
      <el-tab-pane label="未读消息" name="unread" />
      <el-tab-pane label="已读消息" name="read" />
      <el-tab-pane label="系统通知" name="system" />
      <el-tab-pane label="私信" name="private" />
    </el-tabs>

    <!-- 消息列表 -->
    <el-card class="message-list-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span
            ><el-icon><List /></el-icon> 消息列表</span
          >
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索消息"
              :prefix-icon="Search"
              clearable
              style="width: 200px"
              @input="handleSearch"
            />
          </div>
        </div>
      </template>

      <!-- 消息列表 -->
      <div v-if="messageList.length === 0" class="empty-state">
        <el-empty description="暂无消息" />
      </div>

      <div v-else class="message-list">
        <div
          v-for="message in messageList"
          :key="message.id"
          class="message-item"
          :class="{ 'is-unread': !message.isRead }"
          @click="handleMessageClick(message)"
        >
          <div class="message-checkbox">
            <el-checkbox v-model="selectedIds" :label="message.id" @click.stop />
          </div>

          <div class="message-avatar">
            <el-badge :is-dot="!message.isRead" :hidden="message.isRead">
              <el-avatar :size="48" :src="getAvatar(message.type)" />
            </el-badge>
          </div>

          <div class="message-content">
            <div class="message-header">
              <div class="message-title">
                <span class="title-text">{{ message.title }}</span>
                <el-tag v-if="message.type === 'system'" size="small" type="danger">系统</el-tag>
                <el-tag v-else-if="message.type === 'private'" size="small" type="success"
                  >私信</el-tag
                >
                <el-tag v-else size="small" type="info">{{ message.type }}</el-tag>
              </div>
              <div class="message-time">{{ formatTime(message.createTime) }}</div>
            </div>

            <div class="message-body">
              <p class="message-preview" :class="{ 'unread-bold': !message.isRead }">
                {{ message.content }}
              </p>
            </div>

            <div class="message-footer">
              <div class="message-source">
                <el-icon><User /></el-icon>
                <span>{{ message.sender }}</span>
              </div>
              <div class="message-actions">
                <el-button
                  v-if="!message.isRead"
                  type="primary"
                  link
                  size="small"
                  @click.stop="handleMarkRead(message)"
                >
                  标记已读
                </el-button>
                <el-button type="danger" link size="small" @click.stop="handleDelete(message)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 消息详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="currentMessage?.title"
      size="500px"
      direction="rtl"
      destroy-on-close
    >
      <div v-if="currentMessage" class="message-detail">
        <div class="detail-header">
          <div class="sender-info">
            <el-avatar :size="40" :src="getAvatar(currentMessage.type)" />
            <div class="sender-detail">
              <div class="sender-name">{{ currentMessage.sender }}</div>
              <div class="send-time">{{ formatTime(currentMessage.createTime) }}</div>
            </div>
          </div>
          <el-tag :type="currentMessage.type === 'system' ? 'danger' : 'success'">
            {{ currentMessage.type === 'system' ? '系统通知' : '私信' }}
          </el-tag>
        </div>

        <div class="detail-content">
          <h3 class="detail-title">{{ currentMessage.title }}</h3>
          <div class="detail-text">{{ currentMessage.content }}</div>
        </div>

        <div v-if="currentMessage.attachments" class="detail-attachments">
          <div class="attachments-title">附件</div>
          <div class="attachments-list">
            <div
              v-for="file in currentMessage.attachments"
              :key="file.name"
              class="attachment-item"
            >
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ file.size }}</span>
              <el-button link type="primary" size="small">下载</el-button>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <el-button type="primary" @click="handleReply">回复</el-button>
          <el-button @click="handleForward">转发</el-button>
          <el-button @click="handleDelete(currentMessage)">删除</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { MessageApi } from '@/api/message'
import { MessageListRequestBO } from '@/types/message'
import { Document, List, Message, Search, Setting, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
// 类型定义
interface MessageItem {
  id: number
  title: string
  content: string
  type: 'system' | 'private' | 'notification'
  sender: string
  receiver: string
  isRead: boolean
  createTime: string
  readTime?: string
  attachments?: Array<{
    name: string
    size: string
    url: string
  }>
}

interface PagedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 搜索表单
const searchKeyword = ref('')
const activeTab = ref('all')

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

// 数据
const loading = ref(false)
const messageList = ref<MessageItem[]>([])
const selectedIds = ref<number[]>([])
const currentMessage = ref<MessageItem | null>(null)
const drawerVisible = ref(false)

// 计算未读消息数量
const unreadCount = computed(() => {
  return messageList.value.filter((m) => !m.isRead).length
})

const total = computed(() => pagination.total)

// 获取头像
const getAvatar = (type: string) => {
  const avatars: Record<string, string> = {
    system: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    private: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    notification: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  }
  return avatars[type] || avatars.system
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天之内显示时分
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 昨天
  if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 更早显示日期
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

// 构建查询参数
const buildQueryParams = (): MessageListRequestBO => {
  const params: Record<string, any> = {
    page: pagination.current,
    pageSize: pagination.pageSize,
    tab: activeTab.value,
  }

  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }

  return params
}

// 加载消息列表
const loadMessages = async () => {
  try {
    loading.value = true
    const params = buildQueryParams()

    const res = await MessageApi.getMessageList(params)

    if (res.code === 200) {
      messageList.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadMessages()
}

// 标签切换
const handleTabChange = () => {
  pagination.current = 1
  loadMessages()
}

// 标记已读
const handleMarkRead = async (message: MessageItem) => {
  try {
    const res = await request.post('/api/messages/read', { ids: [message.id] })

    if (res.code === 200) {
      message.isRead = true
      ElMessage.success('已标记为已读')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    const unreadIds = messageList.value.filter((m) => !m.isRead).map((m) => m.id)

    if (unreadIds.length === 0) return

    const res = await request.post('/api/messages/read', { ids: unreadIds })

    if (res.code === 200) {
      messageList.value.forEach((m) => {
        m.isRead = true
      })
      ElMessage.success('全部已读')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除消息
const handleDelete = async (message: MessageItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '删除确认', {
      type: 'warning',
    })

    const res = await request.delete(`/api/messages/${message.id}`)

    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadMessages()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 点击消息
const handleMessageClick = (message: MessageItem) => {
  currentMessage.value = message
  drawerVisible.value = true

  // 如果未读，自动标记已读
  if (!message.isRead) {
    handleMarkRead(message)
  }
}

// 回复
const handleReply = () => {
  ElMessage.info('回复功能开发中')
}

// 转发
const handleForward = () => {
  ElMessage.info('转发功能开发中')
}

// 消息设置
const handleSettings = () => {
  ElMessage.info('消息设置功能开发中')
}

// 表格选择变化
const handleSelectionChange = (selection: MessageItem[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadMessages()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadMessages()
}

onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.message-container {
  background-color: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2d3d;
        margin: 0;
        display: inline-block;
      }

      .page-subtitle {
        margin-left: 12px;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .message-tabs {
    background: white;
    padding: 0 20px;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .message-list-card {
    border-radius: 0 0 8px 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
    }

    .empty-state {
      padding: 60px 0;
    }

    .message-list {
      .message-item {
        display: flex;
        gap: 16px;
        padding: 20px;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        &.is-unread {
          background-color: #ecf5ff;

          &:hover {
            background-color: #e1efff;
          }
        }

        .message-checkbox {
          padding-top: 14px;
        }

        .message-avatar {
          position: relative;
        }

        .message-content {
          flex: 1;
          min-width: 0;

          .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .message-title {
              display: flex;
              align-items: center;
              gap: 8px;

              .title-text {
                font-weight: 500;
                color: #1f2d3d;
              }
            }

            .message-time {
              font-size: 12px;
              color: #909399;
            }
          }

          .message-body {
            margin-bottom: 12px;

            .message-preview {
              margin: 0;
              color: #606266;
              font-size: 14px;
              line-height: 1.6;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;

              &.unread-bold {
                font-weight: 500;
                color: #1f2d3d;
              }
            }
          }

          .message-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .message-source {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #909399;
              font-size: 12px;

              .el-icon {
                font-size: 14px;
              }
            }

            .message-actions {
              display: flex;
              gap: 8px;
            }
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #ebeef5;
    }
  }

  .message-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .sender-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .sender-detail {
          .sender-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .send-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .detail-content {
      margin-bottom: 24px;

      .detail-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .detail-text {
        color: #606266;
        line-height: 1.8;
        white-space: pre-wrap;
      }
    }

    .detail-attachments {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .attachments-title {
        font-weight: 500;
        margin-bottom: 12px;
      }

      .attachments-list {
        .attachment-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: white;
          border-radius: 4px;
          margin-bottom: 8px;

          .file-name {
            flex: 1;
            color: #1f2d3d;
          }

          .file-size {
            color: #909399;
            font-size: 12px;
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
