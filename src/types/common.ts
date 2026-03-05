export interface PaginationBO {
  page: number
  pageSize: number
}

// 用户信息
export interface UserBO {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  status: UserStatus
  role: RoleBO
  createTime: string
}

// 用户状态枚举
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

// 角色信息
export interface RoleBO {
  id: number
  name: string
  code: string
  permissions: PermissionBO[]
}

// 权限信息
export interface PermissionBO {
  id: number
  name: string
  code: string
}

// 请求参数
export interface UserListRequestBO extends PaginationBO {
  keyword?: string
  status?: UserStatus
  roleId?: number
}

export interface CreateUserRequestBO {
  username: string
  password: string
  nickname: string
  email: string
  phone: string
  roleId: number
}

export interface UpdateUserRequestBO extends Partial<CreateUserRequestBO> {
  id: number
}
