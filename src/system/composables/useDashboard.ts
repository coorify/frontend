import { defineStore } from 'pinia'
import { router } from '@/router'
import { computed } from 'vue'
import { usePermission } from './usePermission'
import { useService } from './useService'
import { useCookie } from './useCookie'
import { useStorage } from '@vueuse/core'
import { useSignature } from './useSignature'

export interface Menu {
  target?: string
  path?: string

  icon?: string
  perm?: string

  name: string
  children?: Array<Omit<Menu, 'children'>>
}

export interface Tab {
  label: string
  name: string
  closable: boolean
}

export const useDashboard = defineStore('menu', () => {
  const perms = usePermission()
  const service = useService()
  const cookie = useCookie()
  const signature = useSignature()

  const tabDefault = {
    label: '首页',
    name: JSON.stringify('/'),
    closable: false
  }

  const openeds = useStorage<Array<string>>('openeds', [])
  const collapse = useStorage<boolean>('collapse', false)
  const tabs = useStorage<Array<Tab>>('tabs', [tabDefault])
  const tabSelected = useStorage<string>('tabSelected', '')

  const { data: menus, execute: fetchMenu } = service.account.menu(null, {
    immediate: false
  })

  const { data: profile, execute: fetchProfile } = service.account.profile(
    null,
    { immediate: false }
  )

  const { data: sysPerms, execute: fetchSystemPermission } =
    service.admin.permission.system(null, { immediate: false })

  const menuFromRouter = (grp: any, pos?: 'left' | 'top') => {
    const rts = router
      .getRoutes()
      .filter(rt => {
        const mn = rt.meta.menu as any
        const ly = rt.meta.layout
        if (!mn) return false
        return mn.position == pos && ly == 'dashboard'
      })
      .filter(v => {
        const mn = v.meta.menu as any
        if (!mn.perm) return true

        return perms.has(mn.perm)
      })

    for (const rt of rts) {
      const mn = rt.meta.menu as any
      if (!mn.group && grp[mn.name]) {
        console.error(`menu exist: ${mn.name} ${rt.path}`)
        continue
      }

      if (!mn.group) {
        grp[mn.name] = {
          ...mn,
          path: rt.path
        }
        continue
      }

      if (!grp[mn.group]) {
        grp[mn.group] = {
          ...mn,
          name: mn.group,
          children: []
        }
      }

      if (!grp[mn.group].children) {
        console.error(`menu no children: ${mn.group} ${rt.path}`)
        continue
      }

      if (grp[mn.group].children.find((v: any) => v.name == mn.name)) {
        console.error(`menu exist: ${mn.group}.${mn.name} ${rt.path}`)
        continue
      }

      grp[mn.group].children.push({
        ...mn,
        path: rt.path
      })
    }
  }

  const menuFromServer = (grp: any, pos: 'left' | 'top') => {
    if (!menus.value) return

    const mns = menus.value.filter((v: any) => {
      return v.pos == pos
    })

    for (const m of mns) {
      if (!grp[m.group]) {
        grp[m.group] = {
          name: m.group,
          children: []
        }
      }

      grp[m.group].children.push({
        ...m,
        path: m.link,
        target: '_blank'
      })
    }
  }

  const left = computed<Array<Menu>>(() => {
    const grp = {} as any
    menuFromRouter(grp)
    menuFromRouter(grp, 'left')
    menuFromServer(grp, 'left')

    const mns = [] as Array<Menu>
    const ks = Object.keys(grp)
    for (const k of ks) {
      mns.push(grp[k])
    }

    return mns
  })

  const top = computed<Array<Menu>>(() => {
    const grp = {} as any
    menuFromRouter(grp, 'top')
    menuFromServer(grp, 'top')

    const mns = [] as Array<Menu>
    const ks = Object.keys(grp)
    for (const k of ks) {
      mns.push(grp[k])
    }
    return mns
  })

  return {
    collapse,
    openeds,
    left,

    top,
    tabs,
    tabSelected,

    profile,

    sysPerms,

    async reset () {
      collapse.value = false
      tabSelected.value = ''
      tabs.value = [tabDefault]
    },
    async fetch () {
      await perms.fetch(true)
      await fetchMenu(true)
      await fetchProfile(true)
      if (perms.has('admin_all')) {
        await fetchSystemPermission(true)
      }
    },
    async addOpened (idx: string) {
      openeds.value.push(idx)
    },
    async delOpened (idx: string) {
      openeds.value = openeds.value.filter(v => v != idx)
    },
    async delTab (name: string) {
      tabs.value = tabs.value.filter(v => v.name != name)
    },
    async navTo (to: any, label?: string) {
      if (to.target) {
        let url = to.path as string
        // let url = 'http://localhost:3080/system/oauth/profileByJwt'
        if (to.auth) {
          const jwt = cookie.getToken()
          const sig = await signature.signature(jwt)
          if (url.indexOf('?') != -1) {
            url += `&jwt=${jwt}&signature=${sig}`
          } else {
            url += `?jwt=${jwt}&signature=${sig}`
          }
        }
        window.open(url, to.target)
        return
      }

      const name = JSON.stringify(to)
      const fnd = tabs.value.find(v => v.name == name)
      if (!fnd && label) {
        tabs.value.push({
          name: name,
          label: label,
          closable: true
        })
      }
      tabSelected.value = name
      router.push({ path: typeof to === 'string' ? to : to.path })
    }
  }
})
