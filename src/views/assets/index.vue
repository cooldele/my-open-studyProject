<template>
  <div class="assets-index">
    <!-- 搜索表单 - 卡片样式 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="query" class="search-form">
        <el-row :gutter="20" flex>
          <el-form-item label="关键字">
            <el-input
              v-model="query.keyword"
              placeholder="名称/类型"
              clearable
              :prefix-icon="Search"
            />
          </el-form-item>

          <el-form-item label="价格范围">
            <div class="range-input">
              <el-input-number
                v-model="query.minPrice"
                :min="0"
                placeholder="最小"
                controls-position="right"
                class="range-min"
              />
              <span class="range-separator">-</span>
              <el-input-number
                v-model="query.maxPrice"
                :min="0"
                placeholder="最大"
                controls-position="right"
                class="range-max"
              />
            </div>
          </el-form-item>

          <el-form-item label="公司">
            <el-input
              v-model="query.company"
              placeholder="公司名称"
              clearable
              :prefix-icon="OfficeBuilding"
            />
          </el-form-item>

          <el-form-item label="生产日期">
            <el-date-picker
              v-model="query.manufactureDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
          </el-form-item>

          <el-form-item label="领取日期">
            <el-date-picker
              v-model="query.receivedDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
          </el-form-item>

          <el-button type="primary" @click="search" :icon="Search">搜索</el-button>
          <el-button @click="resetQuery" :icon="Refresh">重置</el-button>
        </el-row>
      </el-form>
    </el-card>
    <!-- 操作按钮 -->
    <el-card class="mb-4">
      <el-row>
        <el-col :span="12">
          <el-button type="primary" @click="handleAdd" icon="Plus"> 添加资产 </el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 资产表格 - 卡片样式 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span
            ><el-icon><List /></el-icon> 资产列表</span
          >
          <div class="table-actions">
            <el-tooltip content="刷新" placement="top">
              <el-button circle @click="fetchAssets">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="列设置" placement="top">
              <el-button circle>
                <el-icon><Setting /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <el-table :data="assets" stripe style="width: 100%" border @sort-change="handleSortChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable align="center" />
        <el-table-column prop="name" label="名称" width="150" show-overflow-tooltip>
          <template #default="scope">
            <div class="name-cell">
              <el-avatar :size="24" :src="getAvatar(scope.row.type)" />
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)" effect="plain">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="价格" width="120" sortable align="right">
          <template #default="scope">
            <span class="price">¥ {{ formatPrice(scope.row.price) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="manufactureDate"
          label="生产日期"
          width="120"
          sortable
          align="center"
        />
        <el-table-column prop="receivedDate" label="领取日期" width="120" sortable align="center" />

        <el-table-column prop="company" label="公司" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <div class="company-cell">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ scope.row.company }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          background
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  Delete,
  Edit,
  List,
  OfficeBuilding,
  Refresh,
  Search,
  Setting,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

defineOptions({
  name: 'AssetsPage',
})

type Asset = {
  id: number
  name: string
  type: string
  price: number
  manufactureDate: string
  receivedDate: string
  company: string
}

type PagedResult<T> = {
  total: number
  page: number
  pageSize: number
  list: T[]
}

const assets = ref<Asset[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const query = reactive({
  keyword: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  manufactureDate: undefined as string[] | undefined,
  receivedDate: undefined as string[] | undefined,
  company: undefined as string | undefined,
})

// 格式化价格
const formatPrice = (price: number) => {
  return price.toLocaleString('en-US')
}

// 获取类型对应的标签样式
const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    设备: 'primary',
    软件: 'success',
    版权: 'warning',
  }
  return map[type] || 'info'
}

// 获取类型对应的头像
const getAvatar = (type: string) => {
  const map: Record<string, string> = {
    设备: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    软件: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    版权: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  }
  return map[type] || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
}

// 重置查询
const resetQuery = () => {
  query.keyword = ''
  query.minPrice = undefined
  query.maxPrice = undefined
  query.manufactureDate = undefined
  query.receivedDate = undefined
  query.company = undefined
  page.value = 1
  fetchAssets()
}

// 处理排序
const handleSortChange = ({ prop, order }: any) => {
  console.log('排序:', prop, order)
  // 这里可以添加排序逻辑
}

// 新增资产
const handleAdd = () => {
  ElMessage.success('新增资产功能开发中...')
}

// 编辑资产
const handleEdit = (row: Asset) => {
  ElMessage.success(`编辑资产: ${row.name}`)
}

// 删除资产
const handleDelete = (row: Asset) => {
  ElMessageBox.confirm(`确认删除资产 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 这里添加删除逻辑
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 导出数据
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

function buildQueryParams(obj: Record<string, any>) {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null && v.length !== 0) {
      params.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }
  })
  return params.toString()
}

async function fetchAssets() {
  const q = {
    page: page.value,
    pageSize: pageSize.value,
    keyword: query.keyword || undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    manufactureDate: query.manufactureDate?.join(','),
    receivedDate: query.receivedDate?.join(','),
    company: query.company || undefined,
  }
  const qs = buildQueryParams(q)
  const res = await fetch(`/api/assets?${qs}`)
  const json = await res.json()
  const data: PagedResult<Asset> = json.data
  assets.value = data.list
  total.value = data.total
  page.value = data.page
  pageSize.value = data.pageSize

  ElMessage.success('数据加载成功')
}

function search() {
  page.value = 1
  fetchAssets()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchAssets()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchAssets()
}

onMounted(() => {
  fetchAssets()
})
</script>

<style scoped lang="scss">
.assets-index {
  padding: 20px;
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

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;

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

    .search-form {
      .el-form-item {
        margin-bottom: 16px;
      }

      .range-input {
        display: flex;
        align-items: center;
        gap: 8px;

        .range-min,
        .range-max {
          flex: 1;
        }

        .range-separator {
          color: #909399;
        }
      }

      .full-width {
        width: 100%;
      }

      .search-buttons {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }

  .table-card {
    border-radius: 8px;

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

      .table-actions {
        display: flex;
        gap: 8px;
      }
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .company-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .price {
      font-weight: 500;
      color: #f56c6c;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

/* 覆盖 Element Plus 默认样式 */
:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafbfc;
}

:deep(.el-table) {
  border-radius: 4px;

  th {
    background-color: #fafbfc;
    color: #1f2d3d;
    font-weight: 500;
  }
}

:deep(.el-pagination) {
  padding: 0;

  .el-pagination__total {
    color: #606266;
  }
}
</style>
