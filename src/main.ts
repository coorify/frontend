import { createApp } from 'vue'
import { router } from '@/router'
import { i18n } from '@/i18n'
import { pina } from '@/pinia'
import { vPermission } from '@/system/composables/usePermission'
import { addCollection } from '@iconify/vue'
import { icons } from '@iconify-json/iconoir'
import App from '@/App.vue'

import './global.scss'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/message/style/css'

addCollection(icons)

createApp(App)
  .use(router)
  .use(i18n)
  .use(pina)
  .directive('perm', vPermission)
  .directive('permission', vPermission)
  .mount('#app')

// icons https://icon-sets.iconify.design/
