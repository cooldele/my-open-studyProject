// 请求参数类型定义
export interface MessageListRequestBO {
  page?: number
  pageSize?: number
  tab?: 'all' | 'unread' | 'read' | 'system' | 'private'
  keyword?: string
  startDate?: string
  endDate?: string
}
