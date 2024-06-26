<template>
  <div class="w-full h-full flex flex-col bg-white py-4 px-4">
    <div class="w-full flex flex-row">
      <div class=" w-40">
        <el-select v-model="query.category">
          <el-option key="username" value="username" :label="$t('account.username')"></el-option>
          <el-option key="nickname" value="nickname" :label="$t('account.nickname')"></el-option>
          <el-option key="phone" value="phone" :label="$t('account.phone')"></el-option>
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
        <el-table-column prop="username" :label="$t('account.username')"></el-table-column>
        <el-table-column prop="nickname" :label="$t('account.nickname')"></el-table-column>
        <el-table-column prop="phone" :label="$t('account.phone')"></el-table-column>
        <el-table-column prop="createdAt" :label="$t('label.createdAt')" :formatter="onFormat"></el-table-column>

        <el-table-column :label="$t('label.role')">

          <template #default="scope">
            <el-tooltip placement="bottom">
              <template #content>
                <div class="flex flex-wrap max-w-64">
                  <div class="mr-1 mt-1" v-for="t of roleTags(scope.row)">{{ t }}</div>
                </div>
              </template>
              <el-tag>{{ roleCount(scope.row) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column align="right">

          <template #default="scope">
            <el-button size="small" :type="state.isEnable(scope.row.status) ? 'success' : 'info'"
              @click="onUpdateStatus(scope.row, state.ENABLE)">
              <span>{{ $t(state.isEnable(scope.row.status) ? 'label.enable' : 'label.disable') }}</span>
            </el-button>
            <el-button size="small" type="primary" @click="editer?.show(scope.row)">
              <span>{{ $t('label.edit') }}</span>
            </el-button>
            <!--<el-button size="small" type="danger" @click="deleter?.show(scope.row, 'name')">
              <span>{{ $t('label.delete') }}</span>
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="w-full mt-4 flex justify-center">
      <el-pagination v-if="query.size < reply?.total" v-model:current-page="query.page" background
        layout="prev, pager, next" :total="reply.total" :page-size="query.size" @current-change="execute(true)" />
    </div>
    <system-admin-account-creater ref="creater" @done="onSearch"></system-admin-account-creater>
    <system-admin-account-editer ref="editer" @done="execute(true)"></system-admin-account-editer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { Expose as CreaterExpose } from '@/system/components/SystemAdminAccountCreater.vue'
import { Expose as EditerExpose } from '@/system/components/SystemAdminAccountEditer.vue'
import { useService } from '@/system/composables/useService';
import { useDateTimeFormat } from '@/system/composables/useDateFormat';
import { useStatus } from '@/system/composables/useStatus';

const service = useService()
const state = useStatus()

const creater = ref<CreaterExpose>()
const editer = ref<EditerExpose>()

const query = reactive({
  page: 1,
  size: 15,
  keyword: '',
  category: 'nickname',
})

const { data: reply, execute } = service.admin.account.find(query, { immediate: false })

const onSearch = async () => {
  query.page = 1
  await execute(true)
}

const onUpdateStatus = async (raw: any, mask: number) => {
  const enable = !((raw.status & mask) == mask)
  const { data } = await service.admin.account.status.update({ uuid: raw.uuid, status: mask, enable })
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

const roleCount = (row: any) => {
  return row.roles.length
}

const roleTags = (row: any) => {
  return row.roles.map((r: any) => r.name)
}

onMounted(onSearch)
</script>

<route lang="yaml">
meta:
  layout: dashboard
  menu:
    position: left
    group: 站点管理员
    name: 账号管理
    perm: admin_all
    # icon: iconoir:maps-arrow-diagonal
</route>