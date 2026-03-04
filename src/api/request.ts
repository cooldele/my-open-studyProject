// src/api/request.ts
import router from '@/router'
import { useUserStore } from '@/stores/user'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'

class Request {
  private instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { code, message, data } = response.data

        if (code === 200) {
          return data
        } else if (code === 401) {
          // token 失效
          useUserStore().logout()
          router.push('/login')
          return Promise.reject(new Error(message || '登录过期'))
        } else {
          ElMessage.error(message || '请求失败')
          return Promise.reject(new Error(message))
        }
      },
      (error) => {
        ElMessage.error(error.message || '请求失败')
        return Promise.reject(error)
      },
    )
  }

  public request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url })
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  // 其他方法...
}

export const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})
