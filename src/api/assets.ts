import { AssetListRequestBO } from '@/types/assets'
import { RequestUtil } from '@/utils/RequestUtil'

export const getAssetList = (params: AssetListRequestBO) => {
  return RequestUtil.sendRequest({
    url: '/assets/list',
    method: 'get',
    params,
  })
}
