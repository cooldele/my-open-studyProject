// src/api/user/index.ts
import { request } from '@/api/request'
import type { LoginParams, LoginResponse, UserInfo } from '@/types/user'

// 用户登录
export const login = (data: LoginParams) => {
  return request.post<LoginResponse>('/user/login', data)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get<UserInfo>('/user/info')
}

// 退出登录
export const logout = () => {
  return request.post('/user/logout')
}

// 修改用户信息
export const updateUserInfo = (data: Partial<UserInfo>) => {
  return request.put('/user/info', data)
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request.post('/user/change-password', data)
}
