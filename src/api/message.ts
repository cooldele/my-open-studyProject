// src/api/message.ts
import { MessageListRequestBO } from '@/types/message'
import { RequestUtil } from '@/utils/RequestUtil'
export interface MarkReadRequestBO {
  ids: number[]
}

export interface SendMessageRequestBO {
  receiver: string
  title: string
  content: string
  type?: 'private' | 'notification'
  attachments?: File[]
}

export interface BatchDeleteRequestBO {
  ids: number[]
}

export interface ReplyMessageRequestBO {
  content: string
}

export interface ForwardMessageRequestBO {
  receivers: string[]
}

// 响应数据类型定义
export interface MessageBO {
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

export interface PagedResultBO<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface UnreadCountBO {
  count: number
}

export interface UpdatedCountBO {
  updatedCount: number
}

export interface DeletedCountBO {
  deletedCount: number
}

export interface ResponseData<T> {
  code: number
  message: string
  data: T
}

/**
 * 消息相关 API
 */
export const MessageApi = {
  /**
   * 获取消息列表
   */
  getMessageList(params: MessageListRequestBO): Promise<ResponseData<PagedResultBO<MessageBO>>> {
    return RequestUtil.sendRequest({
      url: '/messages',
      method: 'get',
      params, // GET 请求参数
    })
  },

  /**
   * 获取消息详情
   */
  fetchMessageDetail(id: number): Promise<ResponseData<MessageBO>> {
    return RequestUtil.sendRequest({
      url: `/messages/${id}`,
      method: 'get',
    })
  },

  /**
   * 标记消息为已读
   */
  markAsRead(params: MarkReadRequestBO): Promise<ResponseData<UpdatedCountBO>> {
    return RequestUtil.sendRequest({
      url: '/messages/read',
      method: 'post',
      data: params,
    })
  },

  /**
   * 标记所有消息为已读
   */
  markAllAsRead(): Promise<ResponseData<UpdatedCountBO>> {
    return RequestUtil.sendRequest({
      url: '/messages/read-all',
      method: 'post',
    })
  },

  /**
   * 删除消息
   */
  deleteMessage(id: number): Promise<ResponseData<null>> {
    return RequestUtil.sendRequest({
      url: `/messages/${id}`,
      method: 'delete',
    })
  },

  /**
   * 批量删除消息
   */
  batchDeleteMessages(params: BatchDeleteRequestBO): Promise<ResponseData<DeletedCountBO>> {
    return RequestUtil.sendRequest({
      url: '/messages/batch-delete',
      method: 'post',
      data: params,
    })
  },

  /**
   * 获取未读消息数量
   */
  fetchUnreadCount(): Promise<ResponseData<UnreadCountBO>> {
    return RequestUtil.sendRequest({
      url: '/messages/unread-count',
      method: 'get',
    })
  },

  /**
   * 发送消息
   */
  sendMessage(params: SendMessageRequestBO): Promise<ResponseData<MessageBO>> {
    // 如果有文件附件，需要使用 FormData
    if (params.attachments?.length) {
      const formData = new FormData()
      formData.append('receiver', params.receiver)
      formData.append('title', params.title)
      formData.append('content', params.content)
      if (params.type) formData.append('type', params.type)

      params.attachments.forEach((file) => {
        formData.append('attachments', file)
      })

      return RequestUtil.sendRequest({
        url: '/messages/send',
        method: 'post',
        data: formData,
      })
    }

    // 无附件的情况
    return RequestUtil.sendRequest({
      url: '/messages/send',
      method: 'post',
      data: params,
    })
  },

  /**
   * 回复消息
   */
  replyMessage(id: number, params: ReplyMessageRequestBO): Promise<ResponseData<MessageBO>> {
    return RequestUtil.sendRequest({
      url: `/messages/${id}/reply`,
      method: 'post',
      data: params,
    })
  },

  /**
   * 转发消息
   */
  forwardMessage(id: number, params: ForwardMessageRequestBO): Promise<ResponseData<MessageBO[]>> {
    return RequestUtil.sendRequest({
      url: `/messages/${id}/forward`,
      method: 'post',
      data: params,
    })
  },

  /**
   * 清空已读消息
   */
  clearReadMessages(): Promise<ResponseData<DeletedCountBO>> {
    return RequestUtil.sendRequest({
      url: '/messages/clear-read',
      method: 'delete',
    })
  },
}
