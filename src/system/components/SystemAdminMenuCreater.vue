<template>
  <i-drawer :title="$t('label.create', [$t('label.menu')])" :show-confirm="true" ref="drawer" @confirm="onConfirm">
    <el-form label-width="auto" ref="form" :model="model" :rules="rules">
      <el-form-item :label="$t('label.name')" prop="name">
        <el-input v-model="model.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.group')" prop="group">
        <el-input v-model="model.group"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.position')" prop="pos">
        <el-select v-model="model.pos">
          <el-option key="left" value="left" :label="$t('label.pos_left')" />
          <el-option key="top" value="top" :label="$t('label.pos_top')" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('label.icon')" prop="icon">
        <el-input v-model="model.icon"></el-input>
      </el-form-item>
      <div class="pt-8"></div>
      <el-form-item :label="$t('label.permission')" prop="perm">
        <el-autocomplete class="w-full" v-model="model.perm" clearable
          :fetch-suggestions="onPermSearch"></el-autocomplete>
        <!-- <el-input v-model="model.perm"></el-input> -->
      </el-form-item>
      <el-form-item :label="$t('label.link')" prop="link">
        <el-input v-model="model.link"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.auth')">
        <el-checkbox v-model="model.auth"></el-checkbox>
      </el-form-item>
    </el-form>
  </i-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toValue } from 'vue'
import { Expose as DrawerExpose } from '@/system/components/IDrawer.vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useService } from '@/system/composables/useService';

interface Model {
  name: string
  group: string
  pos: string
  icon: string
  perm: string
  link: string
  auth: boolean
}

export interface Expose {
  show(): PromiseLike<void>
}

const i18n = useI18n()
const service = useService()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const form = ref<FormInstance>()
const model = reactive<Model>({ name: '', group: '', pos: 'left', icon: '', perm: '', link: '', auth: false })
const rules = reactive<FormRules<Model>>({
  name: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.name")]), trigger: 'blur' },
    { min: 4, message: i18n.t("rule.min", [4]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  group: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.group")]), trigger: 'blur' },
    { min: 4, message: i18n.t("rule.min", [4]), trigger: 'change' },
    { max: 16, message: i18n.t("rule.max", [16]), trigger: 'change' },
  ],
  perm: [{
    validator(rule, value, callback) {
      rule = rule
      if (value == "") return callback()

      const prefix = 'perm_'
      if (value.indexOf(prefix) != 0) {
        callback(i18n.t('rule.prefix', [prefix]))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }],
  link: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.link")]), trigger: 'blur' },
    {
      validator(rule, value, callback) {
        rule = rule
        if (value.indexOf("http://") != 0 && value.indexOf("https://") != 0) {
          return callback(i18n.t('rule.prefix', ['http:// or https://']))
        }
        callback()
      },
      trigger: 'change'
    }
  ]
})

const payload = computed(() => {
  return {
    ...toValue(model),
    auth: model.auth ? 1 : 0
  }
})

const queryFind = computed(() => {
  return {
    keyword: model.perm,
    category: 'value',
  }
})

const { data: reply, execute } = service.admin.menu.create(payload, null, { immediate: false })
const { data: perms, execute: fetchPermission } = service.admin.permission.find(queryFind, { immediate: false })

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

const onPermSearch = (keyword: string, callback: any) => {
  keyword = keyword
  fetchPermission(true).then(() => {
    callback(perms.value?.data.map((v: any) => ({ value: v.value })))
  })
}

defineExpose<Expose>({
  async show() {
    model.name = ''
    model.group = ''
    model.icon = ''
    model.perm = ''
    model.link = ''
    model.auth = false
    await drawer.value?.show()
  }
})
</script>