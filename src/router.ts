import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export const router = createRouter({
  history: createWebHashHistory(),
  extendRoutes: routes => setupLayouts(routes)
})

NProgress.configure({
  showSpinner: false
})

router.beforeEach(() => {
  NProgress.start()
})

router.afterEach(() => {
  NProgress.done()
})
