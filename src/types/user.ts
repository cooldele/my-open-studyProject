// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    userInfo: UserInfo
  }
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  gender?: 0 | 1 | 2 // 0:未知 1:男 2:女
  department?: string
  roles: string[]
  permissions: string[]
  createTime: string
}
