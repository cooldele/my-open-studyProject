// src/mock/user.ts
import Mock from 'mockjs'
import { MockMethod } from 'vite-plugin-mock'

export default [
  // 用户登录接口
  {
    url: '/api/user/login',
    method: 'post',
    timeout: 800,
    response: ({ body }: { body: any }) => {
      const { username, password } = body

      if (username === 'admin' && password === '123456') {
        return Mock.mock({
          code: 200,
          message: '登录成功',
          data: {
            token: Mock.Random.guid(),
            userInfo: {
              id: 1,
              username: 'admin',
              nickname: '系统管理员',
              avatar: Mock.Random.image('100x100', '#409EFF', '#fff', 'avatar'),
              email: Mock.mock('@email'),
              phone: '13800138000',
              gender: 1,
              department: '技术部',
              roles: ['admin'],
              permissions: [
                'user:view',
                'user:edit',
                'user:delete',
                'role:view',
                'role:edit',
                'system:view',
                'system:config',
              ],
              createTime: '@datetime',
            },
          },
        })
      } else if (username === 'user' && password === '123456') {
        return Mock.mock({
          code: 200,
          message: '登录成功',
          data: {
            token: Mock.Random.guid(),
            userInfo: {
              id: 2,
              username: 'user',
              nickname: '普通用户',
              avatar: Mock.Random.image('100x100', '#67C23A', '#fff', 'avatar'),
              email: Mock.mock('@email'),
              phone: '13900139000',
              gender: 0,
              department: '市场部',
              roles: ['user'],
              permissions: ['user:view'],
              createTime: '@datetime',
            },
          },
        })
      } else {
        return {
          code: 401,
          message: '用户名或密码错误',
          data: null,
        }
      }
    },
  },

  // 获取用户信息接口
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      // 模拟从token解析用户ID
      const userId = Mock.mock('@pick([1, 2])')

      interface UserInfo {
        id: number;
        username: string;
        nickname: string;
        avatar: string;
        email: string;
        phone: string;
        gender: number;
        department: string;
        roles: string[];
        permissions: string[];
        createTime: string;
      }

      const userMap: Record<number, UserInfo> = {
        1: {
          id: 1,
          username: 'admin',
          nickname: '系统管理员',
          avatar: Mock.Random.image('100x100', '#409EFF', '#fff', 'avatar'),
          email: 'admin@example.com',
          phone: '13800138000',
          gender: 1,
          department: '技术部',
          roles: ['admin'],
          permissions: [
            'user:view',
            'user:edit',
            'user:delete',
            'role:view',
            'role:edit',
            'system:view',
            'system:config',
          ],
          createTime: Mock.mock('@datetime'),
        },
        2: {
          id: 2,
          username: 'user',
          nickname: '普通用户',
          avatar: Mock.Random.image('100x100', '#67C23A', '#fff', 'avatar'),
          email: 'user@example.com',
          phone: '13900139000',
          gender: 0,
          department: '市场部',
          roles: ['user'],
          permissions: ['user:view'],
          createTime: Mock.mock('@datetime'),
        },
      }

      return {
        code: 200,
        message: 'success',
        data: userMap[userId] || null,
      }
    },
  },

  // 退出登录接口
  {
    url: '/api/user/logout',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '退出成功',
        data: null,
      }
    },
  },

  // 修改用户信息接口
  {
    url: '/api/user/info',
    method: 'put',
    response: ({ body }: { body: any }) => {
      return {
        code: 200,
        message: '修改成功',
        data: body,
      }
    },
  },

  // 修改密码接口
  {
    url: '/api/user/change-password',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { oldPassword, newPassword } = body

      if (!oldPassword || !newPassword) {
        return {
          code: 400,
          message: '参数错误',
          data: null,
        }
      }

      if (oldPassword === '123456') {
        return {
          code: 200,
          message: '密码修改成功',
          data: null,
        }
      } else {
        return {
          code: 400,
          message: '原密码错误',
          data: null,
        }
      }
    },
  },

  // 用户列表接口（可选）
  {
    url: '/api/user/list',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { page = 1, size = 10 } = query

      return Mock.mock({
        code: 200,
        message: 'success',
        data: {
          'list|10': [
            {
              'id|+1': (page - 1) * size + 1,
              username: '@word(3,8)',
              nickname: '@cname',
              avatar: "@image('100x100')",
              email: '@email',
              phone: /^1[3-9]\d{9}$/,
              'gender|0-2': 1,
              department: '@cword(3,6)部',
              'roles|1-2': ['@pick(["admin", "editor", "viewer"])'],
              'status|0-1': 1,
              createTime: '@datetime',
            },
          ],
          pagination: {
            page: Number(page),
            size: Number(size),
            total: 100,
          },
        },
      })
    },
  },
] as MockMethod[]
