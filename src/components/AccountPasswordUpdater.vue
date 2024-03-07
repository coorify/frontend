<template>
  <i-collapse :title="$t('password_update.title')">
    <div class="w-full flex justify-center pt-8">
      <!-- <div class="max-w-64"> -->
      <el-form class="md:w-1/3 w-1/2" label-width="auto" ref="form" :model="model" :rules="rules">
        <el-form-item :label="$t('password_update.old')" prop="old">
          <el-input v-model="model.old" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('password_update.new')" prop="new">
          <el-input v-model="model.new" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('password_update.confirm')" prop="confirm">
          <el-input v-model="model.confirm" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button :disabled="model.old == model.new" type="primary" @click="onSave">{{ $t('label.save')
            }}</el-button>
          </div>
        </el-form-item>
      </el-form>
      <!-- </div> -->
    </div>
  </i-collapse>
</template>
<script setup lang="ts">
import { type FormRules, type FormInstance, ElMessage } from 'element-plus';
import { useI18n } from "vue-i18n"
import { reactive, ref } from 'vue';
import { useService } from '@/composables/useService'
import { useBase64 } from '@/composables/useBase64';
import { toRef, computed } from 'vue';

interface Model {
  old: string
  new: string
  confirm: string
}

const i18n = useI18n()
const service = useService()

const form = ref<FormInstance>()

const model = reactive<Model>({
  old: '',
  new: '',
  confirm: ''
})

const rules = reactive<FormRules<Model>>({
  old: [
    { required: true, message: i18n.t("rule.required", [i18n.t('password_update.old')]), trigger: 'blur' },
    { min: 6, message: i18n.t("rule.min", [6]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  new: [
    { required: true, message: i18n.t("rule.required", [i18n.t('password_update.new')]), trigger: 'blur' },
    { min: 6, message: i18n.t("rule.min", [6]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  confirm: [
    { required: true, message: i18n.t("rule.required", [i18n.t('password_update.new')]), trigger: 'blur' },
    {
      validator(rule, value, callback) {
        rule = rule
        if (value != model.new) {
          callback(i18n.t("rule.neq", [i18n.t('password_update.new')]))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ]
})

const obase64 = useBase64(toRef(model, "old"))
const nbase64 = useBase64(toRef(model, "new"))

const payload = computed(() => {
  return {
    old: obase64.base64.value,
    new: nbase64.base64.value
  }
})
const { data: reply, execute } = service.account.password.update(payload, null, { immediate: false })

const onSave = async () => {
  if (!form.value) return
  if (!await form.value.validate()) return

  await execute()

  ElMessage.success({
    message: reply.value.message
  })

  await service.auth.sigout()
}
</script>
<style lang="scss"></style>