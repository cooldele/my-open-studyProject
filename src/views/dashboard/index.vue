<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,024</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">2,568</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥128,950</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">89</div>
              <div class="stat-label">未读消息</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" header="访问量趋势">
          <div ref="visitChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" header="用户来源">
          <div ref="sourceChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card header="最近活动">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
        >
          <div class="activity-item">
            <el-avatar :size="32" :src="activity.avatar" class="mr-3" />
            <div>
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-content">{{ activity.content }}</div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ChatLineRound, Money, ShoppingCart, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 图表实例
const visitChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
let visitChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null

interface Activity {
  avatar: string
  title: string
  content: string
  time: string
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

// 最近活动数据
const activities = ref<Activity[]>([
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    title: '管理员',
    content: '修改了用户权限设置',
    time: '2023-10-26 14:30',
    type: 'primary',
  },
  {
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f1a8739e41b94d70055png.png',
    title: '用户张三',
    content: '提交了新的工单 #1234',
    time: '2023-10-26 10:15',
    type: 'success',
  },
  {
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    title: '系统自动',
    content: '完成了今日数据备份',
    time: '2023-10-26 03:00',
    type: 'warning',
  },
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    title: '管理员',
    content: '添加了新用户李四',
    time: '2023-10-25 16:45',
    type: 'info',
  },
])

// 初始化访问量图表
const initVisitChart = () => {
  if (!visitChartRef.value) return

  visitChart = echarts.init(visitChartRef.value)
  const option = {
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
          ]),
        },
        lineStyle: { width: 3 },
        itemStyle: { color: '#409eff' },
      },
    ],
    grid: { left: 20, right: 20, top: 20, bottom: 20 },
  }
  visitChart.setOption(option)
}

// 初始化用户来源图表
const initSourceChart = () => {
  if (!sourceChartRef.value) return

  sourceChart = echarts.init(sourceChartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 335, name: '直接访问' },
          { value: 310, name: '邮件营销' },
          { value: 234, name: '联盟广告' },
          { value: 135, name: '视频广告' },
          { value: 154, name: '搜索引擎' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
  }
  sourceChart.setOption(option)
}

onMounted(() => {
  initVisitChart()
  initSourceChart()

  // 监听窗口变化，重绘图表
  window.addEventListener('resize', () => {
    visitChart?.resize()
    sourceChart?.resize()
  })
})

onBeforeUnmount(() => {
  visitChart?.dispose()
  sourceChart?.dispose()
  window.removeEventListener('resize', () => {})
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0;

  .stat-card {
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }
  }

  .stat-content {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;

    .el-icon {
      font-size: 24px;
      color: white;
    }
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }

  .chart-card {
    margin-bottom: 20px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    padding: 8px 0;

    .activity-title {
      font-weight: 500;
      color: #303133;
    }

    .activity-content {
      font-size: 13px;
      color: #606266;
      margin-top: 2px;
    }
  }
}
</style>
