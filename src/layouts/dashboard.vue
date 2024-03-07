<template>
  <el-container class="w-full h-full">
    <el-aside class="remove-menu-border border-r border-r-[var(--el-menu-border-color)] bg-white ease-in duration-500"
      :class="{ '!w-52': !collapse, '!w-14': collapse }">
      <div class=" flex justify-center items-center py-4 h-14 cursor-pointer" :class="{ 'px-2': collapse }">
        <div @click="dash.navTo('/')" class="w-full h-full bg-no-repeat bg-center bg-[url(@/assets/index_logo.svg)]">
        </div>
      </div>
      <menu-left :collapse="collapse" class="remove-menu-border"></menu-left>
    </el-aside>
    <el-container>
      <el-header class="!h-28 !px-0 flex flex-col bg-white border-b border-b-[var(--el-menu-border-color)]">
        <div class="w-full h-full px-4 flex flex-row border-b border-b-[var(--el-menu-border-color)]">
          <div class="h-full flex items-center cursor-pointer" @click="collapse = !collapse">
            <el-icon size="32">
              <icon :icon="collapse ? 'iconoir:nav-arrow-left' : 'iconoir:nav-arrow-right'"></icon>
            </el-icon>
          </div>
          <div class="h-full flex items-center">
            <span @click="dash.navTo('/')" class="font-bold text-xl cursor-pointer">{{ env.VITE_APP_NAME }}</span>
          </div>
          <div class="flex-grow flex justify-end items-center">
            <menu-top></menu-top>
          </div>
          <div class="h-full flex items-center remove-menu-border">
            <el-menu mode="horizontal" :ellipsis="false" class="py-1 !h-13">
              <el-sub-menu index="1">
                <template #title>{{ profile?.nickname }}</template>
                <el-menu-item @click="dash.navTo('/system/account/profile', $t('account.profile'))">
                  <span>{{ $t("account.profile") }}</span>
                </el-menu-item>
                <el-menu-item @click="onSigout">
                  <span>{{ $t("label.sigout") }}</span>
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </div>
        </div>
        <div class="w-full remove-tabs-border">
          <el-tabs type="card" v-model="tabSelected" @edit="onTabClose" @tab-click="onTabClick">
            <el-tab-pane v-for="t of tabs" :label="t.label" :name="t.name" :closable="t.closable">
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useDashboard } from '@/composables/useDashboard';
import { useService } from '@/composables/useService';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const env = import.meta.env
const dash = useDashboard()
const service = useService()
const { collapse, tabs, tabSelected, profile } = storeToRefs(dash)


const onSigout = async () => {
  await service.auth.sigout()
}

const onTabClose = async (targetName: any, action: 'remove' | 'add') => {
  if (action == 'remove') {
    dash.delTab(targetName)
  }
}

const onTabClick = async ({ props }: any) => {
  dash.navTo(JSON.parse(props.name), props.label)
}

onMounted(async () => {
  await dash.fetch()
})

</script>