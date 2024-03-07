<template>
  <div class="w-full h-full flex relative overflow-hidden">
    <div class="w-2/5 bg-[#1c1b34] flex justify-center items-center">
      <div class="h-[130%] w-1/2 bg-white transform -rotate-12 absolute -ml-40 -mt-10"></div>
      <div class="w-3/4 z-50 flex flex-col items-center">
        <div class="w-full h-full text-center mb-8">
          <div class="text-2xl font-bold text-slate-950">{{ env.VITE_APP_NAME }}</div>
        </div>

        <div class="w-3/5">
          <el-form label-position="top" :model="model" :rules="rules" ref="form">
            <el-form-item :label="$t('account.username')" prop="username">
              <el-input v-model="model.username" type="text" />
            </el-form-item>
            <el-form-item :label="$t('account.password')" prop="password">
              <el-input v-model="model.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <div class="w-full pt-4">
                <el-button class="w-full" type="primary" size="large" @click="onSigin">
                  <span>{{ $t("label.sigin") }}</span>
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="w-3/5 h-full bg-bottom bg-[url(@/assets/sigin_bg.jpg)]">
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormRules, FormInstance } from 'element-plus';
import { ref, reactive, toRef, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useBase64 } from "@/composables/useBase64"
import { useService } from '@/composables/useService'
import { useCookie } from '@/composables/useCookie';
import { useRouter } from 'vue-router'
import { computed } from 'vue';

interface Model {
  username: string
  password: string
}

const env = import.meta.env
const service = useService()
const router = useRouter()
const i18n = useI18n()

const form = ref<FormInstance>()

const model = reactive<Model>({
  username: "",
  password: ""
})

const rules = reactive<FormRules<Model>>({
  username: [
    { required: true, message: i18n.t("rule.required", [i18n.t("account.username")]), trigger: 'blur' },
    { min: 5, message: i18n.t("rule.min", [5]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  password: [
    { required: true, message: i18n.t("rule.required", [i18n.t("account.password")]), trigger: 'blur' },
    { min: 6, message: i18n.t("rule.min", [6]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ]
})

const base64 = useBase64(toRef(model, "password"))
const cookie = useCookie()

const payload = computed(() => {
  return { username: model.username, password: base64.base64.value }
})

const { data: reply, execute } = service.auth.sigin(payload, null, { immediate: false })

const onSigin = async () => {
  if (!form.value) return
  if (!await form.value.validate()) return

  await execute(true)

  if (!reply.value) return
  const { token, expire } = reply.value
  cookie.setToken(token, expire)
  router.push({ name: '/', replace: true })
}

onMounted(async () => {
  const tk = cookie.getToken()
  if (tk.length > 0) {
    router.push({ name: '/', replace: true })
  }
})
</script>

<route lang="yaml">
meta:
  layout: default
</route>
