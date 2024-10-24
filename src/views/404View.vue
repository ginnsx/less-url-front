<template>
  <n-result status="404" title="404 未找到" description="抱歉，您访问的页面不存在。">
    <template #footer>
      <n-button @click="$router.push('/')">返回首页</n-button>
    </template>
  </n-result>
</template>

<script lang="ts" setup>
import { NResult, NButton } from 'naive-ui'
</script>
