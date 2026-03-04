// src/directives/permission.ts
import { useUserStore } from '@/stores/user'
import type { App } from 'vue'

export default {
  install(app: App) {
    app.directive('permission', {
      mounted(el, binding) {
        const { permissions } = useUserStore()
        const { value } = binding

        if (Array.isArray(value) && value.length) {
          const hasPermission = permissions.some((permission) => value.includes(permission))
          if (!hasPermission) {
            el.parentNode?.removeChild(el)
          }
        }
      },
    })
  },
}
