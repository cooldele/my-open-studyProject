import type { LoginParams, UserInfo } from '@/types/user'
import { RequestUtil } from '@/utils/RequestUtil/index'

// 用户登录
export const login = (data: LoginParams) => {
  return RequestUtil.sendRequest({
    url: '/user/login',
    method: 'post',
    data, // GET 请求参数
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return RequestUtil.sendRequest({
    url: '/user/info',
    method: 'get',
  })
}

// 退出登录
export const logout = () => {
  return RequestUtil.sendRequest({
    url: '/user/logout',
    method: 'post',
  })
}

// 修改用户信息
export const updateUserInfo = (data: Partial<UserInfo>) => {
  return RequestUtil.sendRequest({
    url: '/user/info',
    method: 'put',
    data,
  })
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return RequestUtil.sendRequest({
    url: '/user/change-password',
    method: 'post',
    data,
  })
}

// 获取用户列表
export const getUserList = (data: {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  role?: string
  phone?: string
  status?: number
  isAdmin?: boolean
  createTime?: string
}) => {
  return RequestUtil.sendRequest({
    url: '/user/list',
    method: 'get',
    data,
  })
}
