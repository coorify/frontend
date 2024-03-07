<template>
  <div class="w-full h-full flex flex-col bg-white py-4 px-4">
    <div class="w-full flex flex-row">
      <div class=" w-40">
        <el-select v-model="query.category">
          <el-option key="desc" value="desc" :label="$t('label.desc')"></el-option>
          <el-option key="group" value="group" :label="$t('label.group')"></el-option>
          <el-option key="value" value="value" :label="$t('label.name')"></el-option>
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
      <el-table :data="reply?.data">
        <el-table-column type="index" width="50" />
        <el-table-column prop="value" :label="$t('label.name')"></el-table-column>
        <el-table-column prop="group" :label="$t('label.group')"></el-table-column>
        <el-table-column prop="desc" :label="$t('label.desc')"></el-table-column>
        <el-table-column prop="createdAt" :label="$t('label.createdAt')" :formatter="onFormat"></el-table-column>
        <el-table-column align="right">

          <template #default="scope">
            <el-button size="small" type="danger" @click="deleter?.show(scope.row, 'value')">
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
    <admin-permission-creater ref="creater" @done="onSearch"></admin-permission-creater>
    <i-deleter :title="$t('label.delete', [$t('label.permission')])" ref="deleter" @done="onDelete"></i-deleter>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { Expose as CreaterExpose } from '@/components/AdminPermissionCreater.vue'
import { Expose as DeleterExpose } from '@/components/IDeleter.vue'
import { useService } from '@/composables/useService';
import { useDateTimeFormat } from '@/composables/useDateFormat';

const service = useService()

const creater = ref<CreaterExpose>()
const deleter = ref<DeleterExpose>()

const query = reactive({
  page: 1,
  size: 15,
  keyword: '',
  category: 'group',
})

const { data: reply, execute } = service.admin.permission.find(query, { immediate: false })

const onSearch = async () => {
  query.page = 1
  await execute(true)
}

const onDelete = async (raw: any) => {
  const { data } = await service.admin.permission.delete({ value: raw.value }, null)
  await ElMessage.success({
    message: data.value.message
  })
  await onSearch()
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
      position: left
      group: 站点管理员
      name: 权限管理
      perm: 'admin_all'
  </route>