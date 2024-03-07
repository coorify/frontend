<template>
  <div class="w-full flex flex-row bg-white py-4 px-4">
    <div class="h-auto flex flex-col">
      <div class="text-2xl text-zinc-600 font-bold">
        <span class="mr-2">您好</span>
        <span class="text-zinc-800 mr-2">{{ profile?.nickname }}</span>
        <span class="">，欢迎回来</span>
      </div>
      <div class="mt-8 font-semibold text-xl">
        <div class="text-6xl text-center text-zinc-800">
          {{ useTimeFormat(now.toString()) }}
        </div>
        <div class="text-zinc-600 text-center mt-4">
          {{ useDateFormat(now.toString()) }}
        </div>
      </div>
      <div class="flex-grow flex flex-col">
        <div class="my-2 text-zinc-600 text-sm">快捷入口</div>
        <div class="flex-grow flex items-end">
          <el-button plain type="primary" class="mr-8" v-for="mn of menus" @click="dash.navTo(mn, mn.name)">
            <span>{{ mn.name }}</span>
          </el-button>
        </div>
      </div>
    </div>
    <div class="flex-grow flex flex-row justify-end">
      <img class="h-64" src="@/assets/index_banner.jpeg" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, useDashboard } from '@/composables/useDashboard';
import { useNow } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed } from 'vue'
import { useTimeFormat, useDateFormat } from '@/composables/useDateFormat'

const now = useNow()

const menus = computed(() => {
  const mns = [] as Array<Menu>
  left.value.forEach((rmn) => {
    if (!rmn.children) {
      mns.push(rmn)
    } else {
      rmn.children?.forEach((mn) => {
        mns.push(mn)
      })
    }
  })
  return mns.slice(0, 8)
})

const dash = useDashboard()
const { profile, left } = storeToRefs(dash)
</script>

<route lang="yaml">
meta:
  layout: dashboard
</route>