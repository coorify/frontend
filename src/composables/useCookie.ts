import { useCookies } from '@vueuse/integrations/useCookies'
import { useDashboard } from './useDashboard'
import { router } from '@/router'

export const useCookie = () => {
  const dash = useDashboard()
  const cookies = useCookies()

  return {
    getToken () {
      return (cookies.get('token') || '') as string
    },
    setToken (val: string, maxAge: number) {
      if (val != '') {
        dash.reset()
      } else {
        router.push({ name: '/system/authenticate/sigin', replace: true })
      }
      return cookies.set('token', val, { maxAge, path: '/' })
    }
  }
}
