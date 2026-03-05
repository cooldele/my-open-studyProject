import router from '@/router'
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElLoading, ElMessage } from 'element-plus' // 同步导入

// 响应数据格式
export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

// 请求配置
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean // 是否显示加载中
  showError?: boolean // 是否显示错误提示
  loadingText?: string // 加载提示文字
  retry?: number // 重试次数
  retryDelay?: number // 重试延迟(ms)
}

// 请求参数
export interface RequestParams {
  url: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  data?: any
  params?: any
  config?: RequestConfig
}

class RequestUtilClass {
  private instance: AxiosInstance
  private pendingRequests: Map<string, AbortController> = new Map()
  private loadingCount: number = 0
  private loadingInstance: any = null

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加 token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 处理重复请求（取消相同URL的pending请求）
        const requestKey = this.generateRequestKey(config)
        if (this.pendingRequests.has(requestKey)) {
          const controller = this.pendingRequests.get(requestKey)
          controller?.abort()
          this.pendingRequests.delete(requestKey)
        }

        // 添加 AbortController
        const controller = new AbortController()
        config.signal = controller.signal
        this.pendingRequests.set(requestKey, controller)

        // 显示loading
        const showLoading = (config as any).showLoading !== false
        if (showLoading) {
          this.showLoading((config as any).loadingText || '加载中...')
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 移除pending请求记录
        this.removePendingRequest(response.config)

        // 隐藏loading
        const showLoading = (response.config as any).showLoading !== false
        if (showLoading) {
          this.hideLoading()
        }

        const { code, message, data } = response.data as ResponseData

        // 根据业务状态码处理
        if (code === 200) {
          return response.data
        } else {
          // 处理业务错误
          const showError = (response.config as any).showError !== false
          if (showError) {
            ElMessage.error(message || '请求失败')
          }

          // 处理特定错误码
          this.handleBusinessError(code, message)

          return Promise.reject(new Error(message || '请求失败'))
        }
      },
      (error) => {
        // 移除pending请求记录
        if (error.config) {
          this.removePendingRequest(error.config)
        }

        // 隐藏loading
        const showLoading = error.config?.showLoading !== false
        if (showLoading) {
          this.hideLoading()
        }

        // 处理HTTP错误
        this.handleHttpError(error)

        return Promise.reject(error)
      },
    )
  }

  /**
   * 生成请求key
   */
  private generateRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
  }

  /**
   * 移除pending请求
   */
  private removePendingRequest(config: AxiosRequestConfig) {
    const requestKey = this.generateRequestKey(config)
    if (this.pendingRequests.has(requestKey)) {
      this.pendingRequests.delete(requestKey)
    }
  }

  /**
   * 显示loading
   */
  private showLoading(text: string = '加载中...') {
    this.loadingCount++
    if (this.loadingCount === 1) {
      // 只有第一个请求才打开
      this.loadingInstance = ElLoading.service({
        lock: true,
        text,
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
  }

  /**
   * 隐藏loading
   */
  private hideLoading() {
    this.loadingCount--
    if (this.loadingCount <= 0) {
      this.loadingCount = 0
      if (this.loadingInstance) {
        this.loadingInstance.close()
        this.loadingInstance = null
      }
    }
  }

  /**
   * 处理业务错误
   */
  private handleBusinessError(code: number, message: string) {
    switch (code) {
      case 401: // 未授权
        localStorage.removeItem('token')
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
        break
      case 403: // 禁止访问
        router.push('/403')
        break
      case 404: // 资源不存在
        router.push('/404')
        break
      case 500: // 服务器错误
        ElMessage.error('服务器错误，请稍后重试')
        break
    }
  }

  /**
   * 处理HTTP错误
   */
  private handleHttpError(error: any) {
    if (axios.isCancel(error)) {
      console.log('请求已取消:', error.message)
      return
    }

    const showError = error.config?.showError !== false

    if (error.code === 'ECONNABORTED') {
      if (showError) {
        ElMessage.error('请求超时，请稍后重试')
      }
    } else if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status
      switch (status) {
        case 400:
          if (showError) ElMessage.error('请求参数错误')
          break
        case 401:
          if (showError) ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          if (showError) ElMessage.error('没有权限访问')
          break
        case 404:
          if (showError) ElMessage.error('请求的资源不存在')
          break
        case 500:
          if (showError) ElMessage.error('服务器内部错误')
          break
        default:
          if (showError) ElMessage.error(`请求失败: ${status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (showError) {
        ElMessage.error('网络连接失败，请检查网络')
      }
    } else {
      // 请求配置出错
      if (showError) {
        ElMessage.error('请求配置错误')
      }
    }
  }

  /**
   * 发送请求
   */
  public async sendRequest<T = any>({
    url,
    method,
    data,
    params,
    config = {},
  }: RequestParams): Promise<T> {
    try {
      const response = await this.instance.request({
        url,
        method,
        data,
        params,
        ...config,
      })
      return response as T
    } catch (error) {
      return Promise.reject(error)
    }
  }

  public get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.sendRequest<T>({ url, method: 'get', params, config })
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.sendRequest<T>({ url, method: 'post', data, config })
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.sendRequest<T>({ url, method: 'put', data, config })
  }

  public delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.sendRequest<T>({ url, method: 'delete', params, config })
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.sendRequest<T>({ url, method: 'patch', data, config })
  }

  /**
   * 上传文件
   */
  public upload<T = any>(
    url: string,
    file: File | File[],
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    const formData = new FormData()

    if (Array.isArray(file)) {
      file.forEach((f) => formData.append('files', f))
    } else {
      formData.append('file', file)
    }

    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        formData.append(k, v as any)
      })
    }

    return this.sendRequest<T>({
      url,
      method: 'post',
      data: formData,
      config: { ...config, headers: { 'Content-Type': 'multipart/form-data' } },
    })
  }

  /**
   * 下载文件（可选）
   */
  public download(url: string, params?: any) {
    return this.instance.get(url, { params, responseType: 'blob' })
  }
}

export const RequestUtil = new RequestUtilClass()
export default RequestUtil
