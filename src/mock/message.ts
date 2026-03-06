// src/mock/messages.ts
import Mock from 'mockjs'
import { MockMethod } from 'vite-plugin-mock'

// 生成模拟消息数据
const generateMessages = (count: number) => {
  const messages = []

  const types = ['system', 'private', 'notification']
  const systemTitles = ['系统维护通知', '账号安全提醒', '版本更新通知', '服务变更通知']
  const privateTitles = ['私信', '项目讨论', '任务分配', '会议邀请']
  const senders = ['系统管理员', '张三', '李四', '王五', '赵六', '钱七']

  for (let i = 0; i < count; i++) {
    const type = Mock.mock('@pick(types)')
    const isSystem = type === 'system'

    const message = {
      id: i + 1,
      title: isSystem
        ? Mock.mock(`@pick(${JSON.stringify(systemTitles)})`)
        : Mock.mock(`@pick(${JSON.stringify(privateTitles)})`),
      content: Mock.mock('@paragraph(2, 5)'),
      type,
      sender: isSystem ? '系统' : Mock.mock(`@pick(${JSON.stringify(senders)})`),
      receiver: '@name',
      isRead: Mock.mock('@boolean'),
      createTime: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
      readTime: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
      attachments: Mock.mock('@boolean(0.3)')
        ? [
            {
              name: Mock.mock('@filename') + '.pdf',
              size: Mock.mock('@integer(100, 5000)') + 'KB',
              url: Mock.mock('@url'),
            },
          ]
        : undefined,
    }
    messages.push(message)
  }

  return messages.sort(
    (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
  )
}

const allMessages = generateMessages(50)

export default [
  // 获取消息列表
  {
    url: '/api/messages',
    method: 'get',
    timeout: 800,
    response: ({ query }: { query: any }) => {
      const { page = 1, pageSize = 10, tab = 'all', keyword = '' } = query

      let filteredMessages = [...allMessages]

      // 按标签过滤
      if (tab === 'unread') {
        filteredMessages = filteredMessages.filter((m) => !m.isRead)
      } else if (tab === 'read') {
        filteredMessages = filteredMessages.filter((m) => m.isRead)
      } else if (tab === 'system') {
        filteredMessages = filteredMessages.filter((m) => m.type === 'system')
      } else if (tab === 'private') {
        filteredMessages = filteredMessages.filter((m) => m.type === 'private')
      }

      // 按关键词搜索
      if (keyword) {
        filteredMessages = filteredMessages.filter(
          (m) =>
            m.title.includes(keyword) || m.content.includes(keyword) || m.sender.includes(keyword),
        )
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageMessages = filteredMessages.slice(start, end)

      return {
        code: 200,
        message: 'success',
        data: {
          list: pageMessages,
          total: filteredMessages.length,
          page: Number(page),
          pageSize: Number(pageSize),
        },
      }
    },
  },

  // 标记消息为已读
  {
    url: '/api/messages/read',
    method: 'post',
    timeout: 500,
    response: ({ body }: { body: any }) => {
      const { ids } = body

      // 模拟更新消息状态
      allMessages.forEach((msg) => {
        if (ids.includes(msg.id)) {
          msg.isRead = true
          msg.readTime = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
        }
      })

      return {
        code: 200,
        message: '操作成功',
        data: {
          updatedCount: ids.length,
        },
      }
    },
  },

  // 删除单条消息
  {
    url: '/api/messages/:id',
    method: 'delete',
    timeout: 500,
    response: ({ query }: { query: any }) => {
      const { id } = query
      const index = allMessages.findIndex((m) => m.id === Number(id))

      if (index !== -1) {
        allMessages.splice(index, 1)
        return {
          code: 200,
          message: '删除成功',
          data: null,
        }
      }

      return {
        code: 404,
        message: '消息不存在',
        data: null,
      }
    },
  },

  // 批量删除消息
  {
    url: '/api/messages/batch-delete',
    method: 'post',
    timeout: 600,
    response: ({ body }: { body: any }) => {
      const { ids } = body

      // 模拟批量删除
      for (let i = allMessages.length - 1; i >= 0; i--) {
        if (ids.includes(allMessages[i].id)) {
          allMessages.splice(i, 1)
        }
      }

      return {
        code: 200,
        message: '批量删除成功',
        data: {
          deletedCount: ids.length,
        },
      }
    },
  },

  // 获取未读消息数量
  {
    url: '/api/messages/unread-count',
    method: 'get',
    timeout: 300,
    response: () => {
      const unreadCount = allMessages.filter((m) => !m.isRead).length

      return {
        code: 200,
        message: 'success',
        data: {
          count: unreadCount,
        },
      }
    },
  },
] as MockMethod[]
