<template>
  <i-drawer :title="$t('label.edit', [$t('label.account')]) + `[${model.nickname}]`" :show-confirm="true" ref="drawer"
    @confirm="onConfirm">
    <div class="w-full flex flex-row flex-wrap">
      <el-tooltip v-for="role in model.inputTags">
        <template #content>
          <div class="flex flex-wrap max-w-64">
            <div class="mr-1 mt-1" v-for="t of permTags(role)">{{ t }}</div>
          </div>
          <!-- <div v-for="p in role.perms">{{ JSON.stringify(p) }}</div> -->
        </template>
        <el-tag :key="role.uuid" closable size="large" :disable-transitions="false" @close="onRoleRemove(role)"
          class="mr-2 mb-2">
          {{ role.name }}
        </el-tag>
      </el-tooltip>

      <el-autocomplete v-if="model.inputVisible" v-model="model.inputValue" :fetch-suggestions="onRoleSearch"
        ref="input" @blur="onInputHide" @select="onRoleSelect"></el-autocomplete>
      <el-button v-else @click="onInputShow">{{ $t('label.add') }}</el-button>

    </div>
  </i-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { Expose as DrawerExpose } from '@/components/IDrawer.vue'
import { ElInput, ElMessage } from 'element-plus';
import { useService } from '@/composables/useService';
import { useArrayDifference } from '@vueuse/core';
import { useDashboard } from '@/composables/useDashboard';
import { storeToRefs } from 'pinia';

export interface Expose {
  show(raw: any): PromiseLike<void>
}

interface Model {
  uuid: string,
  nickname: string,
  inputVisible: boolean
  inputValue: string,
  inputTags: Array<any>
}

const service = useService()
const dash = useDashboard()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const model = reactive<Model>({ uuid: '', nickname: '', inputVisible: false, inputValue: '', inputTags: [] })
const input = ref<InstanceType<typeof ElInput>>()

const querySystem = computed(() => {
  return { keyword: model.inputValue }
})

const queryAccount = computed(() => {
  return { uuid: model.uuid }
})

const { sysPerms } = storeToRefs(dash)
const { data: roleSystem, execute: fetchRoleSystem } = service.admin.role.find(querySystem, { immediate: false })
const { data: roleAccount, execute: fetchRoleAccount } = service.admin.account.roles(queryAccount, { immediate: false })

const onConfirm = async () => {
  const n1 = roleAccount.value.map((v: any) => v.name)
  const n2 = model.inputTags.map((v) => v.name)
  const s1 = useArrayDifference(n1, n2)
  const s2 = useArrayDifference(n2, n1)

  if (s1.value.length != 0 || s2.value.length != 0) {
    const { data: reply } = await service.admin.account.role.update({
      uuid: model.uuid,
      values: model.inputTags.map((v) => v.uuid)
    })

    ElMessage.success({
      message: reply.value.message
    })
  }

  await drawer.value?.close()
  emits('done')
}

const onInputShow = async () => {
  model.inputVisible = true
  nextTick(() => {
    input.value?.focus()
  })
}

const onInputHide = async () => {
  model.inputVisible = false
  model.inputValue = ''
}

const onRoleSearch = (queryString: string, callback: any) => {
  queryString = queryString
  fetchRoleSystem(true).then(() => {
    callback(roleSystem.value?.data.map((v: any) => ({ value: v.name })))
  })
}

const onRoleSelect = async (val: any) => {
  const role = roleSystem.value?.data.find((v: any) => v.name == val.value)
  if (!model.inputTags.find((v) => v.uuid == role.uuid)) {
    model.inputTags.push(role)
  }
  await onInputHide()
}

const onRoleRemove = async (val: any) => {
  model.inputTags = model.inputTags.filter(v => v.uuid != val.uuid)
}

const permTags = (row: any) => {
  if (!row.perms || !sysPerms.value) return []

  const perms = row.perms.map((v: any) => {
    return sysPerms.value.find((s: any) => s.value == v.perm)
  })

  const group = {} as any
  for (const perm of perms) {
    if (!group[perm.group]) {
      group[perm.group] = []
    }
    group[perm.group].push(perm.desc)
  }

  return Object.keys(group).map((k) => {
    return `${k}[${group[k].join(",")}]`
  })
}

defineExpose<Expose>({
  async show(raw: any) {
    model.uuid = raw.uuid
    model.nickname = raw.nickname
    model.inputVisible = false

    await fetchRoleAccount(true)
    await drawer.value?.show()

    model.inputTags = []
    model.inputTags.push(...roleAccount.value)
  }
})
</script>