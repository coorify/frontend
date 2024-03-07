<template>
  <div>
    <el-drawer v-model="show" direction="rtl" @close="onClose" :close-on-click-modal="false">
      <template #header>
        <div class="font-bold text-lg text-zinc-600">{{ props.title }}</div>
      </template>
      <template #default>
        <slot></slot>
      </template>
      <template #footer>
        <el-button @click="show = false">{{ $t("label.cancel") }}</el-button>
        <el-button type="primary" @click="onConfirm" v-if="props.showConfirm">{{ $t("label.confirm") }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

export interface Props {
  title: string
  showConfirm?: boolean
}

export interface Expose {
  show(): PromiseLike<void>
  close(): PromiseLike<void>
}

const props = defineProps<Props>()
const emits = defineEmits(["close", "confirm"])
const show = ref<boolean>(false)

const onClose = async () => {
  emits('close')
}

const onConfirm = async () => {
  emits('confirm')
}

defineExpose<Expose>({
  async show() {
    show.value = true
  },
  async close() {
    show.value = false
  }
})
</script>