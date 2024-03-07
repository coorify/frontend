import { computed, Ref } from 'vue'
import { useBase64 as base64 } from '@vueuse/core'

export const useBase64 = (val: Ref<string>) => {
  const toArrayBuffer = computed(() => {
    const vl = val.value
    const ab = new ArrayBuffer(vl.length)
    const u8 = new Uint8Array(ab)

    for (let i = 0; i < vl.length; i++) {
      u8[i] = vl.charCodeAt(i)
    }

    return ab
  })

  return base64(toArrayBuffer)
}
