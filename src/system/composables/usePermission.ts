import { defineStore } from 'pinia'
import type { Directive, DirectiveBinding } from 'vue'
import { useService } from '@/system/composables/useService'
import { pina } from '@/pinia'

export const vPermission: Directive = {
  mounted (el: HTMLElement, bd: DirectiveBinding) {
    const perm = usePermission(pina)
    if (bd.value && !perm.has(bd.value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export const usePermission = defineStore('permission', () => {
  const service = useService()

  const { data: perms, execute: fetch } = service.account.permission(null, {
    immediate: false
  })

  return {
    perms,

    fetch,
    has (pms: string) {
      return perms.value?.find((v: string) => v == pms)
    }
  }
})
