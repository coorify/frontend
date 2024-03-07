<template>
  <i-drawer :title="$t('label.create', [$t('label.role')])" :show-confirm="true" ref="drawer" @confirm="onConfirm">
    <el-form ref="form" :model="model" :rules="rules">
      <el-form-item :label="$t('label.name')" prop="name">
        <el-input v-model="model.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.desc')" prop="desc">
        <el-input v-model="model.desc" type="textarea" resize="none"></el-input>
      </el-form-item>
    </el-form>
  </i-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Expose as DrawerExpose } from '@/components/IDrawer.vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useService } from '@/composables/useService';

interface Model {
  name: string
  desc: string
}

export interface Expose {
  show(): PromiseLike<void>
}

const i18n = useI18n()
const service = useService()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const form = ref<FormInstance>()
const model = reactive<Model>({ name: '', desc: '' })
const rules = reactive<FormRules<Model>>({
  name: [
    { required: true, message: i18n.t('rule.required', [i18n.t('label.name')]), trigger: 'blur' },
    { min: 4, message: i18n.t("rule.min", [4]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  desc: [
    { required: true, message: i18n.t('rule.required', [i18n.t('label.desc')]), trigger: 'blur' },
    { min: 2, message: i18n.t("rule.min", [2]), trigger: 'change' },
    { max: 256, message: i18n.t("rule.max", [256]), trigger: 'change' },
  ]
})

const { data: reply, execute } = service.admin.role.create(model, null, { immediate: false })

const onConfirm = async () => {
  if (!form.value) return
  if (!await form.value.validate()) return

  await execute(true)

  ElMessage.success({
    message: reply.value.message
  })

  await drawer.value?.close()
  emits('done')
}

defineExpose<Expose>({
  async show() {
    model.name = ''
    model.desc = ''
    await drawer.value?.show()
  }
})

</script>