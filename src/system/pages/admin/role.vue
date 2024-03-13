<template>
  <div class="w-full h-full flex flex-col bg-white py-4 px-4">
    <div class="w-full flex flex-row">
      <div class="flex-grow px-4">
        <el-input v-model="query.keyword" :placeholder="$t('label.keyword')">
          <template #prefix>
            <icon icon="iconoir:search"></icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" @click="onSearch">{{ $t("label.search") }}</el-button>
      <el-button type="success" @click="creater?.show()">{{ $t("label.create") }}</el-button>
    </div>
    <div class="w-full flex-grow mt-4 overflow-y-auto">
      <el-table :data="reply?.data" table-layout="auto">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" :label="$t('label.name')"></el-table-column>
        <el-table-column prop="desc" :label="$t('label.desc')"></el-table-column>
        <el-table-column :label="$t('label.createdAt')" :formatter="onFormat"></el-table-column>
        <el-table-column :label="$t('label.permission')">

          <template #default="scope">
            <el-tooltip placement="bottom">
              <template #content>
                <div class="flex flex-wrap max-w-64">
                  <div class="mr-1 mt-1" v-for="t of permTags(scope.row)">{{ t }}</div>
                </div>
              </template>
              <el-tag>{{ permCount(scope.row) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="right">

          <template #default="scope">
            <el-button size="small" :type="state.isEnable(scope.row.status) ? 'success' : 'info'"
              @click="onUpdateStatus(scope.row, state.ENABLE)">
              <span>{{ $t(state.isEnable(scope.row.status) ? 'label.enable' : 'label.disable') }}</span>
            </el-button>
            <el-button size="small" :type="state.isDefault(scope.row.status) ? 'success' : 'info'"
              @click="onUpdateStatus(scope.row, state.DEFAULT)">
              <span>{{ $t(state.isDefault(scope.row.status) ? 'status.nodefault' : 'status.asdefault') }}</span>
            </el-button>
            <el-button size="small" type="primary" @click="editer?.show(scope.row)">
              <span>{{ $t('label.edit') }}</span>
            </el-button>
            <el-button size="small" type="danger" @click="deleter?.show(scope.row, 'name')">
              <span>{{ $t('label.delete') }}</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="w-full mt-4 flex justify-center">
      <el-pagination v-if="query.size < reply?.total" v-model:current-page="query.page" background
        layout="prev, pager, next" :total="reply.total" :page-size="query.size" @current-change="execute(true)" />
    </div>
    <system-admin-role-creater ref="creater" @done="onSearch"></system-admin-role-creater>
    <system-admin-role-editer ref="editer" @done="execute(true)"></system-admin-role-editer>
    <system-deleter :title="$t('label.delete', [$t('label.role')])" ref="deleter" @done="onDelete"></system-deleter>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { Expose as CreaterExpose } from '@/system/components/SystemAdminRoleCreater.vue'
import { Expose as EditerExpose } from '@/system/components/SystemAdminRoleEditer.vue'
import { Expose as DeleterExpose } from '@/system/components/SystemDeleter.vue'
import { useService } from '@/system/composables/useService';
import { useDateTimeFormat } from '@/system/composables/useDateFormat';
import { useDashboard } from '@/system/composables/useDashboard';
import { storeToRefs } from 'pinia';
import { useStatus } from '@/system/composables/useStatus';

const service = useService()
const dash = useDashboard()
const state = useStatus()

const creater = ref<CreaterExpose>()
const deleter = ref<DeleterExpose>()
const editer = ref<EditerExpose>()

const query = reactive({
  page: 1,
  size: 15,
  keyword: ''
})

const { sysPerms } = storeToRefs(dash)
const { data: reply, execute } = service.admin.role.find(query, { immediate: false })

const onSearch = async () => {
  query.page = 1
  await execute(true)
}

const onDelete = async (raw: any) => {
  const { data } = await service.admin.role.delete({ uuid: raw.uuid }, null)
  await ElMessage.success({
    message: data.value.message
  })
  await onSearch()
}

const onUpdateStatus = async (raw: any, mask: number) => {
  const enable = !((raw.status & mask) == mask)
  const { data } = await service.admin.role.status.update({ uuid: raw.uuid, status: mask, enable })
  await ElMessage.success({
    message: data.value.message
  })
  await execute(true)
}

const onFormat = (row: any) => {
  return useDateTimeFormat(row.createdAt)
}

const permCount = (row: any) => {
  return row?.perms.length
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

onMounted(onSearch)
</script>

<route lang="yaml">
  meta:
    layout: dashboard
    menu:
      position: left
      group: 站点管理员
      name: 角色管理
      perm: admin_all
  </route>