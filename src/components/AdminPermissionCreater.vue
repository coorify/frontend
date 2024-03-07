<template>
  <i-drawer :title="$t('label.create', [$t('label.permission')])" :show-confirm="true" ref="drawer" @confirm="onConfirm">
    <el-form label-width="auto" ref="form" :model="model" :rules="rules">
      <el-form-item :label="$t('label.name')" prop="value">
        <el-input v-model="model.value"></el-input>
      </el-form-item>
      <el-form-item :label="$t('label.group')" prop="group">
        <el-autocomplete class="w-full" v-model="model.group" clearable
          :fetch-suggestions="onGroupSearch"></el-autocomplete>
        <!-- <el-input v-model="model.group"></el-input> -->
      </el-form-item>
      <el-form-item :label="$t('label.desc')" prop="desc">
        <el-input v-model="model.desc" type="textarea" resize="none"></el-input>
      </el-form-item>
    </el-form>
  </i-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from "vue-i18n"
import { type FormRules, type FormInstance, ElMessage } from 'element-plus';
import { Expose as DrawerExpose } from '@/components/IDrawer.vue'
import { useService } from '@/composables/useService';


export interface Expose {
  show(): PromiseLike<void>
}

interface Model {
  value: string
  group: string
  desc: string
}

const i18n = useI18n()
const service = useService()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const form = ref<FormInstance>()
const model = reactive<Model>({ value: "", group: "", desc: "" })
const rules = reactive<FormRules<Model>>({
  value: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.name")]), trigger: 'blur' },
    {
      validator(rule, value, callback) {
        const prefix = 'perm_'
        rule = rule
        if (value.indexOf(prefix) != 0) {
          callback(i18n.t('rule.prefix', [prefix]))
        } else {
          callback()
        }
      }, trigger: 'change'
    },
    { min: 6, message: i18n.t("rule.min", [6]), trigger: 'change' },
    { max: 64, message: i18n.t("rule.max", [64]), trigger: 'change' },
  ],
  group: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.group")]), trigger: 'blur' },
    { min: 4, message: i18n.t("rule.min", [4]), trigger: 'change' },
    { max: 32, message: i18n.t("rule.max", [32]), trigger: 'change' },
  ],
  desc: [
    { required: true, message: i18n.t("rule.required", [i18n.t("label.desc")]), trigger: 'blur' },
    { max: 32, message: i18n.t("rule.max", [32]), trigger: 'change' },
  ]
})

const query = computed(() => {
  return { keyword: model.group }
})

const { data: reply, execute: doCreate } = service.admin.permission.create(model, null, { immediate: false })
const { data: groups, execute: doGroupSearch } = service.admin.permission.group(query, { immediate: false })

const onConfirm = async () => {
  if (!form.value) return
  if (!await form.value.validate()) return

  await doCreate(true)

  ElMessage.success({
    message: reply.value.message
  })

  await drawer.value?.close()
  emits('done')
}

const onGroupSearch = (keyword: string, callback: any) => {
  keyword = keyword
  doGroupSearch(true).then(() => {
    callback(groups.value.map((v: string) => ({ value: v })))
  })
}

defineExpose<Expose>({
  async show() {
    model.value = ''
    model.group = ''
    model.desc = ''
    await drawer.value?.show()
  }
})


</script>