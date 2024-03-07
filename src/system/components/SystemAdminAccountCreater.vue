<template>
  <i-drawer :title="$t('label.create', [$t('label.account')])" :show-confirm="true" ref="drawer" @confirm="onConfirm">
    <el-form label-width="auto" ref="form" :model="model" :rules="rules">
      <el-form-item :label="$t('account.username')" prop="username">
        <el-input v-model="model.username"></el-input>
      </el-form-item>
      <el-form-item :label="$t('account.nickname')" prop="nickname">
        <el-input v-model="model.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="$t('account.phone')" prop="phone">
        <el-input v-model="model.phone"></el-input>
      </el-form-item>
      <div class="pt-8"></div>
      <el-form-item :label="$t('password_update.new')" prop="password">
        <el-input v-model="model.password" type="password" show-password></el-input>
      </el-form-item>
      <el-form-item :label="$t('password_update.confirm')" prop="passwordConfirm">
        <el-input v-model="model.passwordConfirm" type="password" show-password></el-input>
      </el-form-item>
    </el-form>
  </i-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, toRef, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Expose as DrawerExpose } from '@/system/components/IDrawer.vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus';
import { useService } from '@/system/composables/useService';
import { useBase64 } from '@/system/composables/useBase64';

interface Model {
  username: string
  nickname: string
  phone: string
  password: string
  passwordConfirm: string
}

export interface Expose {
  show(): PromiseLike<void>
}

const i18n = useI18n()
const service = useService()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const form = ref<FormInstance>()
const model = reactive<Model>({ username: '', nickname: '', phone: '', password: '', passwordConfirm: '' })
const rules = reactive<FormRules<Model>>({
  username: [
    { required: true, message: i18n.t("rule.required", [i18n.t("account.username")]), trigger: 'blur' },
    { min: 5, message: i18n.t("rule.min", [5]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
    {
      validator(rule, value, callback) {
        rule = rule
        const regex = /^[a-zA-Z0-9]{5,16}$/

        if (!regex.test(value)) {
          return callback(i18n.t('rule.format'))
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  nickname: [
    { required: true, message: i18n.t("rule.required", [i18n.t("account.nickname")]), trigger: 'blur' },
    { min: 2, message: i18n.t("rule.min", [2]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  phone: [
    { required: true, message: i18n.t("rule.required", [i18n.t("account.phone")]), trigger: 'blur' },
    { len: 11, message: i18n.t("rule.len", [11]), trigger: 'change' },
    {
      validator(rule, value, callback) {
        rule = rule
        const regex = /^1((34[0-8])|(8\d{2})|(([35][0-35-9]|4[579]|66|7[35678]|9[1389])\d{1}))\d{7}$/
        if (!regex.test(value)) {
          return callback(i18n.t('rule.format'))
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  password: [
    { required: true, message: i18n.t("rule.required", [i18n.t('account.password')]), trigger: 'blur' },
    { min: 6, message: i18n.t("rule.min", [6]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  passwordConfirm: [
    { required: true, message: i18n.t("rule.required", [i18n.t('password_update.new')]), trigger: 'blur' },
    {
      validator(rule, value, callback) {
        rule = rule
        if (value != model.password) {
          callback(i18n.t("rule.neq", [i18n.t('account.password')]))
        } else {
          callback()
        }
      }, trigger: 'change'
    }
  ]
})

const base64 = useBase64(toRef(model, "password"))
const payload = computed(() => {
  return {
    username: model.username,
    nickname: model.nickname,
    phone: model.phone,
    password: base64.base64.value
  }
})

const { data: reply, execute } = service.admin.account.create(payload, null, { immediate: false })

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
    await drawer.value?.show()
  }
})
</script>