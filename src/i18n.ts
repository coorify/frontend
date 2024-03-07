import { createI18n } from 'vue-i18n'
import * as i18n_cn from '@/i18n/cn.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'cn',
  messages: {
    cn: i18n_cn
  }
})
