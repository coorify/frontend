<template>
  <div class="w-full">
    <div class="w-full bg-white px-4 py-4">
      <el-descriptions :border="true">
        <el-descriptions-item label="UUID" :span="2">
          {{ profile?.uuid }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('label.createdAt')" :span="2">
          {{ useDateTimeFormat(profile?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('account.username')" class="!min-w-40">
          {{ profile?.username }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('account.phone')">
          {{ profile?.phone }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('account.nickname')">
          {{ profile?.nickname }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="w-full bg-white px-4 py-4 mt-8">
      <system-account-password-updater></system-account-password-updater>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useService } from '@/system/composables/useService';
import { useDateTimeFormat } from '@/system/composables/useDateFormat'
import { onMounted } from 'vue';

const service = useService()
const { data: profile, execute: fetchProfile } = service.account.profile(null, { immediate: false })

onMounted(async () => {
  await fetchProfile()
})
</script>

<route lang="yaml">
  meta:
    layout: dashboard
</route>