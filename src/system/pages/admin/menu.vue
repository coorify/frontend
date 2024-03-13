<template>
  <div class="w-full h-full flex flex-col bg-white py-4 px-4">
    <div class="w-full flex flex-row">
      <div class=" w-40">
        <el-select v-model="query.category">
          <el-option key="name" value="name" :label="$t('label.name')"></el-option>
          <el-option key="group" value="group" :label="$t('label.group')"></el-option>
          <el-option key="perm" value="perm" :label="$t('label.permission')"></el-option>
        </el-select>
      </div>
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
        <el-table-column :label="$t('label.name')">

          <template #default="scope">
            <div class="flex flex-row items-center">
              <icon v-if="scope.row.icon" :icon="scope.row.icon" class="mr-1"></icon>
              <div>{{ scope.row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" :label="$t('label.group')"></el-table-column>
        <el-table-column prop="pos" :label="$t('label.position')">

          <template #default="scope">
            <span>{{ $t(`label.pos_${scope.row.pos || 'left'}`) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="perm" :label="$t('label.permission')"></el-table-column>
        <el-table-column prop="link" :label="$t('label.link')"></el-table-column>
        <el-table-column prop="createdAt" :label="$t('label.createdAt')" :formatter="onFormat"></el-table-column>
        <el-table-column :label="$t('label.auth')">

          <template #default="scope">
            <el-tag v-if="scope.row.auth" type="success">
              <icon icon="iconoir:bright-star"></icon>
            </el-tag>
          </template>

        </el-table-column>
        <el-table-column align="right">

          <template #default="scope">
            <el-button size="small" :type="state.isEnable(scope.row.status) ? 'success' : 'info'"
              @click="onUpdateStatus(scope.row, state.ENABLE)">
              <span>{{ $t(state.isEnable(scope.row.status) ? 'label.enable' : 'label.disable') }}</span>
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
    <system-admin-menu-creater ref="creater" @done="onSearch"></system-admin-menu-creater>
    <system-deleter :title="$t('label.delete', [$t('label.menu')])" ref="deleter" @done="onDelete"></system-deleter>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { Expose as CreaterExpose } from '@/system/components/SystemAdminMenuCreater.vue'
import { Expose as DeleterExpose } from '@/system/components/SystemDeleter.vue'
import { useService } from '@/system/composables/useService';
import { useDateTimeFormat } from '@/system/composables/useDateFormat';
import { useStatus } from '@/system/composables/useStatus';

const service = useService()
const state = useStatus()

const creater = ref<CreaterExpose>()
const deleter = ref<DeleterExpose>()

const query = reactive({
  page: 1,
  size: 15,
  keyword: '',
  category: 'name',
})

const { data: reply, execute } = service.admin.menu.find(query, { immediate: false })

const onSearch = async () => {
  query.page = 1
  await execute()
}


const onDelete = async (raw: any) => {
  const { data } = await service.admin.menu.delete({ uuid: raw.uuid }, null)
  await ElMessage.success({
    message: data.value.message
  })
  await onSearch()
}

const onUpdateStatus = async (raw: any, mask: number) => {
  const enable = !((raw.status & mask) == mask)
  const { data } = await service.admin.menu.status.update({ uuid: raw.uuid, status: mask, enable })
  await ElMessage.success({
    message: data.value.message
  })
  await execute(true)
}

const onFormat = (row: any, column: any, cellValue: any) => {
  row = row
  column = column
  return useDateTimeFormat(cellValue)
}

onMounted(onSearch)
</script>

<route lang="yaml">
meta:
  layout: dashboard
  menu:
    # position: header
    group: 站点管理员
    name: 菜单管理
    perm: admin_all
</route>