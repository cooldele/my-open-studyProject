// src/utils/errorHandler.ts
import { ElMessage } from 'element-plus'
import { App } from 'vue'

export default {
  install(app: App) {
    app.config.errorHandler = (err, instance, info) => {
      console.error('全局错误:', err, instance, info)
      ElMessage.error('系统错误，请联系管理员')
    }
  },
}
