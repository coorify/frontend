import { useCookie } from './useCookie'
import { createPost, createGet, createPut, createDelete } from './useFetch'

export const useService = () => {
  const cookie = useCookie()

  const sigout = () => {
    cookie.setToken('', -1)
  }

  return {
    auth: {
      sigin: createPost('/system/auth/sigin'),
      sigout
    },
    account: {
      profile: createGet('/system/account/profile'),
      permission: createGet('/system/account/permission'),
      menu: createGet('/system/account/menu'),
      password: {
        update: createPut('/system/account/password/update')
      }
    },
    admin: {
      permission: {
        create: createPost('/system/admin/permission/create'),
        group: createGet('/system/admin/permission/group'),
        find: createGet('/system/admin/permission/find'),
        delete: createDelete('/system/admin/permission/delete'),
        system: createGet('/system/admin/permission/system')
      },
      role: {
        create: createPost('/system/admin/role/create'),
        find: createGet('/system/admin/role/find'),
        delete: createDelete('/system/admin/role/delete'),
        status: {
          update: createPut('/system/admin/role/status/update')
        },
        permissions: createGet('/system/admin/role/permissions'),
        permission: {
          update: createPut('/system/admin/role/permission/update')
        }
      },
      account: {
        create: createPost('/system/admin/account/create'),
        find: createGet('/system/admin/account/find'),
        status: {
          update: createPut('/system/admin/account/status/update')
        },
        roles: createGet('/system/admin/account/roles'),
        role: {
          update: createPut('/system/admin/account/role/update')
        }
      },
      menu: {
        create: createPost('/system/admin/menu/create'),
        find: createGet('/system/admin/menu/find'),
        delete: createDelete('/system/admin/menu/delete'),
        status: {
          update: createPut('/system/admin/menu/status/update')
        }
      }
    }
  }
}
