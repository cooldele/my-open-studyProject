// src/utils/lazyLoad.ts
export const lazyLoad = (view: string) => {
  return () => import(/* webpackChunkName: "[request]" */ `@/views/${view}.vue`)
}
