<template>
  <i-drawer :title="$t('label.edit', [$t('label.role')]) + `[${model.name}]`" :show-confirm="true" ref="drawer"
    @confirm="onConfirm">
    <el-tree :props="treeOpt" node-key="value" :data="treeData" show-checkbox ref="tree"
      :default-checked-keys="permsRole" :default-expand-all="true">

    </el-tree>
  </i-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Expose as DrawerExpose } from '@/components/IDrawer.vue'
import { useService } from '@/composables/useService';
import { TreeInstance, ElMessage } from 'element-plus'
import { useArrayDifference } from '@vueuse/core';
import { useDashboard } from '@/composables/useDashboard';
import { storeToRefs } from 'pinia';

export interface Expose {
  show(raw: any): PromiseLike<void>
}

interface Model {
  uuid: string,
  name: string
}

const service = useService()
const dash = useDashboard()

const emits = defineEmits(['done'])
const drawer = ref<DrawerExpose>()
const model = reactive<Model>({ uuid: '', name: '' })

const queryPayload = computed(() => {
  return {
    uuid: model.uuid
  }
})

const { sysPerms: permsSystem } = storeToRefs(dash)
const { data: permsRole, execute: fetchPermissionRole } = service.admin.role.permissions(queryPayload, { immediate: false })

const tree = ref<TreeInstance>()
const treeOpt = reactive({
  children: 'children',
  label: 'name',
})
const treeData = computed(() => {
  if (!permsSystem.value) return []

  const obj = {} as any
  for (const pm of permsSystem.value) {
    if (!obj[pm.group]) {
      obj[pm.group] = {
        name: pm.group,
        value: '',
        children: []
      }
    }

    obj[pm.group].children.push({
      name: `${pm.desc}(${pm.value})`,
      value: pm.value
    })
  }

  return Object.keys(obj).map((k) => {
    return obj[k]
  })
})

const onConfirm = async () => {
  const spms = tree.value?.getCheckedKeys().filter((v) => v != '') as Array<any>

  const s1 = useArrayDifference(permsRole, spms)
  const s2 = useArrayDifference(spms, permsRole)
  if (s1.value.length != 0 || s2.value.length != 0) {
    const { data: reply } = await service.admin.role.permission.update({
      uuid: model.uuid,
      values: spms
    })

    ElMessage.success({
      message: reply.value.message
    })
  }

  await drawer.value?.close()
  permsRole.value = [-1]
  emits('done')
}

defineExpose<Expose>({
  async show(raw: any) {
    model.uuid = raw.uuid
    model.name = raw.name
    tree.value?.setCheckedKeys([], true)
    await fetchPermissionRole(true)
    await drawer.value?.show()
  }
})
</script>