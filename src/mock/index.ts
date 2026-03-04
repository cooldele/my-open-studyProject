// src/mock/index.ts
import { MockMethod } from 'vite-plugin-mock'
import productMock from './product'
import userMock from './user'

// 合并所有 mock 接口
export default [...userMock, ...productMock] as MockMethod[]
