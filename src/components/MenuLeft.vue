<template>
  <el-menu :collapse="props.collapse" :ellipsis="false" :default-openeds="openeds" class="!h-14"
    :class="{ 'remove-menu-icon': props.collapse }" @open="dash.addOpened" @close="dash.delOpened">
    <div v-for="(m, i) in left">
      <el-sub-menu :index="`${i}`" v-if="m.children">
        <template #title>
          <div v-if="m.icon" class="flex items-center">
            <div>{{ m.icon }}</div>
            <el-icon>
              <Icon :icon="(m.icon as string)" />
            </el-icon>
            <span v-if="!props.collapse">{{ m.name }}</span>
          </div>
          <div v-else>
            <span v-if="!props.collapse">{{ m.name }}</span>
            <span v-else>{{ m.name.charAt(0) }}</span>
          </div>
        </template>
        <el-menu-item v-for="s of m.children" @click="dash.navTo(s, s.name)">
          <div class="flex items-center">
            <el-icon v-if="s.icon">
              <Icon :icon="(s.icon as string)" />
            </el-icon>
            <span>{{ s.name }}</span>
          </div>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else @click="dash.navTo(m, m.name)">
        <div v-if="m.icon" class="flex items-center">
          <el-icon>
            <Icon :icon="(m.icon as string)" />
          </el-icon>
          <span v-if="!props.collapse">{{ m.name }}</span>
        </div>
        <div v-else>
          <span v-if="!props.collapse">{{ m.name }}</span>
          <span v-else>{{ m.name.charAt(0) }}</span>
        </div>
      </el-menu-item>
    </div>
  </el-menu>
</template>

<script setup lang="ts">
import { useDashboard } from '@/composables/useDashboard'
import { storeToRefs } from 'pinia'
import { Icon } from '@iconify/vue';

interface Props {
  collapse?: boolean
}

const props = defineProps<Props>()
const dash = useDashboard()
const { left, openeds } = storeToRefs(dash)
</script>

<style lang="scss">
.remove-menu-icon {
  @apply w-14;

  .el-sub-menu__title {
    justify-content: center;
  }

  .el-menu-item {
    justify-content: center;
  }

  .el-sub-menu__icon-arrow {
    display: none !important;
  }
}
</style>@/composables/useDashboard