import { PaginationBO } from './common'
export interface AssetListRequestBO extends PaginationBO {
  id?: number
  name?: string
  type?: string
  price?: number
  manufactureDate?: string[]
  receivedDate?: string[]
  company?: string
  minPrice?: number
  maxPrice?: number
}
