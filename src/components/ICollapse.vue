<template>
  <div class="w-full remove-collapse-border">
    <el-collapse>
      <el-collapse-item>
        <template #title>
          <div class="font-bold text-lg text-zinc-600">{{ props.title }}</div>
        </template>
        <slot></slot>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
</script>