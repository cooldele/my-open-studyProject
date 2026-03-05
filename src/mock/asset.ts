interface Asset {
  id: number
  name: string
  type: string
  price: number // 价格
  manufactureDate: string // 生产日期 ISO yyyy‑MM‑dd
  receivedDate: string // 领取日期
  company: string // 公司
  recipient: string // 新增：领取人
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const companies = ['阿里巴巴', '腾讯', '华为', '字节跳动', '京东']
const recipients = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'] // 示例领取人列表

const assets: Asset[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `资产 ${i + 1}`,
  type: ['设备', '软件', '版权'][i % 3],
  price: Math.round(Math.random() * 100000),
  manufactureDate: randomDate(new Date(2018, 0, 1), new Date(2023, 11, 31))
    .toISOString()
    .slice(0, 10),
  receivedDate: randomDate(new Date(2019, 0, 1), new Date(2025, 11, 31))
    .toISOString()
    .slice(0, 10),
  company: companies[i % companies.length],
  recipient: recipients[i % recipients.length], // 新增：随机分配领取人
}))

export interface AssetQuery {
  page?: number // 当前页
  pageSize?: number // 每页数量
  keyword?: string // 名称/类型关键字
  minPrice?: number // 价格下限
  maxPrice?: number // 价格上限
  manufactureDate?: string // 精确生产日期
  receivedDate?: string // 精确领取日期
  company?: string // 公司名称关键字
  recipient?: string // 新增：领取人关键字（可选，用于查询）
}

export interface PagedResult<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

export function queryAssets(q: AssetQuery = {}): PagedResult<Asset> {
  const page = q.page ?? 1
  const pageSize = q.pageSize ?? 10
  let filtered = assets

  if (q.keyword && q.keyword.trim()) {
    const kw = q.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.type.toLowerCase().includes(kw),
    )
  }
  if (typeof q.minPrice === 'number') {
    filtered = filtered.filter((a) => a.price >= q.minPrice!)
  }
  if (typeof q.maxPrice === 'number') {
    filtered = filtered.filter((a) => a.price <= q.maxPrice!)
  }
  if (q.manufactureDate) {
    filtered = filtered.filter((a) => a.manufactureDate === q.manufactureDate)
  }
  if (q.receivedDate) {
    filtered = filtered.filter((a) => a.receivedDate === q.receivedDate)
  }
  if (q.company && q.company.trim()) {
    const kw = q.company.trim().toLowerCase()
    filtered = filtered.filter((a) => a.company.toLowerCase().includes(kw))
  }
  if (q.recipient && q.recipient.trim()) {
    const kw = q.recipient.trim().toLowerCase()
    filtered = filtered.filter((a) => a.recipient.toLowerCase().includes(kw))
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return {
    total,
    page,
    pageSize,
    list,
  }
}

// 下面导出符合 vite-plugin-mock 的接口格式（与 user.ts 里其他 mock 一致）
import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/assets/list',
    method: 'get',
    response: ({ query }: { query: AssetQuery }) => {
      const q: AssetQuery = {
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
        keyword: query.keyword,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        manufactureDate: query.manufactureDate,
        receivedDate: query.receivedDate,
        company: query.company,
        recipient: query.recipient,
      }
      const res = queryAssets(q)
      return {
        code: 200,
        message: 'ok',
        data: res,
      }
    },
  },
] as MockMethod[]
