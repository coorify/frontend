import { useDateFormat as useFormat } from '@vueuse/core'

export const useDateTimeFormat = (date: string) => {
  const fmt = 'YYYY-MM-DD HH:mm'

  return useFormat(date, fmt).value
}

export const useTimeFormat = (date: string) => {
  const fmt = 'HH:mm:ss'

  return useFormat(date, fmt).value
}

export const useDateFormat = (date: string) => {
  const fmt = 'YYYY-MM-DD'

  return useFormat(date, fmt).value
}
