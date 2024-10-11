<template>
  <div class="dashboard">
    <n-card>
      <template #header>
        <n-h1>仪表板</n-h1>
      </template>
      <n-flex vertical size="large">
        <OverviewStats />
        <LinkList />
      </n-flex>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { NH1, NCard, NFlex } from 'naive-ui'
import OverviewStats from '@/components/OverviewStats.vue'
import LinkList from '@/components/LinkList.vue'
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.n-card {
  flex-grow: 1;
}
</style>
