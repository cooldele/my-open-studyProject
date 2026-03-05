<!-- views/user/index.vue -->
<template>
  <div class="user-management-container">
    <!-- 顶部搜索栏 -->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="mb-4">
      <el-row>
        <el-col :span="12">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 添加用户
          </el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon> 导出
          </el-button>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon> 导入
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="80" />

        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-details">
                <div class="user-name">
                  <span class="name">{{ row.nickname }}</span>
                  <el-tag v-if="row.isAdmin" type="success" size="small">管理员</el-tag>
                </div>
                <div class="user-account">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" prop="role" width="120">
          <template #default="{ row }">
            <el-tag :type="roleTypeMap[row.role] || undefined">
              {{ roleMap[row.role] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="手机号" prop="phone" width="130" />

        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <user-form-dialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :current-user="currentUser"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { getUserList } from '@/api/user'
import { PagedResult } from '@/mock/asset'
import { formatDate } from '@/utils/date'
import { Delete, Download, Edit, Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import UserFormDialog from './components/UserFormDialog.vue'

interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  role: string
  phone: string
  status: number
  isAdmin: boolean
  createTime: string
}

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  status: '',
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
})

// 数据
const loading = ref(false)
const userList = ref<User[]>([])
const selectedIds = ref<number[]>([])
const currentUser = ref<User | null>(null)

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

// 角色映射
const roleMap: Record<string, string> = {
  admin: '管理员',
  editor: '编辑',
  viewer: '查看者',
  guest: '游客',
}

const roleTypeMap: Record<string, string> = {
  admin: 'danger',
  editor: 'warning',
  viewer: 'info',
  guest: 'success',
}

// 加载用户列表
const loadUserList = async () => {
  try {
    loading.value = true
    // 这里调用 API
    const res = await getUserList()
    console.log(res)
    const data: PagedResult<User> = res.data
    userList.value = data.list || []

    pagination.total = userList.value.length
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    status: '',
  })
  handleSearch()
}

// 添加用户
const handleAdd = () => {
  dialogMode.value = 'add'
  currentUser.value = null
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (user: User) => {
  dialogMode.value = 'edit'
  currentUser.value = { ...user }
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.nickname}" 吗？`, '删除确认', {
      type: 'warning',
    })

    // 调用删除 API
    ElMessage.success('删除成功')
    loadUserList()
  } catch {
    // 用户取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除确认',
      { type: 'warning' },
    )

    // 调用批量删除 API
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadUserList()
  } catch {
    // 用户取消删除
  }
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

// 状态切换
const handleStatusChange = async (user: User) => {
  try {
    // 调用更新状态 API
    ElMessage.success(`用户已${user.status ? '启用' : '禁用'}`)
  } catch {
    // 失败时恢复原状态
    user.status = user.status ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadUserList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadUserList()
}

// 对话框成功回调
const handleDialogSuccess = () => {
  dialogVisible.value = false
  loadUserList()
}

onMounted(() => {
  loadUserList()
})
</script>

<style lang="scss" scoped>
.user-management-container {
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details {
      .user-name {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .name {
          font-weight: 500;
        }
      }

      .user-account {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
