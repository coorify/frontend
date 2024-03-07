<template>
  <div class="remove-menu-border">
    <el-menu mode="horizontal" :ellipsis="false" class="!h-14">
      <div v-for="(m, i) in top">
        <el-sub-menu :index="`${i}`" v-if="m.children">
          <template #title>
            <span>{{ m.name }}</span>
          </template>
          <el-menu-item v-for="s of m.children" @click="dash.navTo(s, s.name)">
            <span>{{ s.name }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else @click="dash.navTo(m, m.name)">
          <span>{{ m.name }}</span>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from '@/composables/useDashboard'
import { storeToRefs } from 'pinia'

const dash = useDashboard()
const { top } = storeToRefs(dash)
</script>