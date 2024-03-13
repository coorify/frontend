<template></template>
<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n';
import get from 'lodash.get'

interface Props {
  title?: string
}

const i18n = useI18n()
const props = defineProps<Props>()
const emits = defineEmits(['done'])


export interface Expose {
  show(v: any, key?: string, title?: string): PromiseLike<void>
}

defineExpose<Expose>({
  async show(v: any, key?: string, title?: string) {

    const val = key ? get(v, key) : v
    const msg = `<strong>${val}</strong>`

    await ElMessageBox.prompt(i18n.t('label.delete_confirm', [msg]), title ? title : props.title, {
      type: 'warning',
      dangerouslyUseHTMLString: true,
      cancelButtonText: i18n.t('label.cancel'),
      confirmButtonText: i18n.t('label.confirm'),
      inputPlaceholder: val,
      inputValidator(v: string) {
        if (v == val) return true
        return i18n.t('rule.neq', [val])
      }
    })

    emits('done', v)
  }
})
</script>