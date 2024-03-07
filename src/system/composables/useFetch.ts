import { createFetch } from '@vueuse/core'
import type { MaybeRefOrGetter, UseFetchOptions } from '@vueuse/core'
import { useCookie } from './useCookie'
import { useSignature } from './useSignature'
import { ElNotification } from 'element-plus'
import { i18n } from '@/i18n'
import { computed, toValue } from 'vue'

const urlRef = (url: string, query?: MaybeRefOrGetter<Record<string, any>>) => {
  return computed(() => {
    if (!query) return url

    const val = toValue(query)
    const ks = Object.keys(val)

    if (ks.length > 0) {
      let qstr = ''
      for (const k of ks) {
        qstr += `${k}=${encodeURIComponent(val[k])}&`
      }

      qstr = qstr.slice(0, -1)
      return url + `?${qstr}`
    }

    return url
  })
}

export const useFetch = <T>(
  url: MaybeRefOrGetter<string>,
  useFetchOptions?: UseFetchOptions
) => {
  const env = import.meta.env
  const cookie = useCookie()
  const signat = useSignature()

  const baseUrl = env.PROD ? '' : env.VITE_API_HOST

  const fetch = createFetch({
    baseUrl,
    options: {
      async beforeFetch(ctx) {
        ctx.options.headers = {
          ...ctx.options.headers,
          token: cookie.getToken()
        }

        // signature
        let msg = ''
        if (ctx.options.body) {
          msg += ctx.options.body
        }

        if (ctx.url.includes('?')) {
          msg += ctx.url.split('?')[1]
        }

        const signature = await signat.signature(msg)

        ctx.options.headers = {
          ...ctx.options.headers,
          signature: signature as string
        }

        return ctx
      },
      async afterFetch(ctx) {
        const { response } = ctx
        const signature = (await response.headers.get('signature')) || ''
        const body = await response.text()
        const hasPub = await signat.hasPubKey()

        if (signature != '' && !hasPub) {
          const message = 'Please configure the key for signature verification'

          ElNotification({
            type: 'error',
            title: i18n.global.t('label.error'),
            message: message
          })

          return {}
        }

        if (hasPub && !(await signat.verify(body, signature))) {
          ElNotification({
            type: 'warning',
            title: i18n.global.t('label.warning'),
            message:
              'Signature verification does not match, please do not use in unsecured networks.'
          })
        }

        if (ctx.data.payload) {
          ctx.data = ctx.data.payload
        }
        return ctx
      },
      async onFetchError(ctx) {
        if (!ctx.response) return ctx

        const {
          data,
          response: { status }
        } = ctx

        ElNotification({
          type: 'error',
          title: i18n.global.t('label.error'),
          message: data.message || data
        })

        if (status == 401 || status == 403) {
          cookie.setToken('', -1)
        }

        return ctx
      }
    },
    fetchOptions: {
      mode: 'cors'
    }
  })

  return fetch<T>(url, useFetchOptions || {})
}

export const createPost = (url: string) => {
  return (payload?: any, query?: any, useFetchOptions?: UseFetchOptions) => {
    return useFetch(urlRef(url, query), useFetchOptions).json().post(payload)
  }
}

export const createGet = (url: string) => {
  return (query?: any, useFetchOptions?: UseFetchOptions) => {
    return useFetch(urlRef(url, query), useFetchOptions).json().get()
  }
}

export const createPut = (url: string) => {
  return (payload?: any, query?: any, useFetchOptions?: UseFetchOptions) => {
    return useFetch(urlRef(url, query), useFetchOptions).json().put(payload)
  }
}

export const createDelete = (url: string) => {
  return (payload?: any, query?: any, useFetchOptions?: UseFetchOptions) => {
    return useFetch(urlRef(url, query), useFetchOptions).json().delete(payload)
  }
}

// export const usePost = <T>(
//   url: MaybeRefOrGetter<string>,
//   payload?: MaybeRefOrGetter<unknown>
// ) => {
//   return useFetch<T>(url).json().post(payload)
// }

// export const useGet = <T>(url: MaybeRefOrGetter<string>) => {
//   return useFetch<T>(url).get().json()
// }
