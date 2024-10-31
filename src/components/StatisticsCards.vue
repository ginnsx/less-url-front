<template>
  <n-grid :x-gap="12" :y-gap="8" :cols="3">
    <n-gi v-for="stat in stats" :key="stat.label">
      <n-card class="stat-card">
        <n-statistic :label="stat.label" tabular-nums>
          <template #prefix>
            <n-icon :component="stat.icon" :color="iconColor" />
          </template>
          <n-number-animation
            show-separator
            v-if="typeof stat.value === 'number'"
            :to="stat.value"
          />
          <n-text v-else>{{ stat.value }}</n-text>
        </n-statistic>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { NCard, NGrid, NGi, NIcon, NStatistic, NNumberAnimation, NText } from 'naive-ui'

interface Stat {
  label: string
  value: number | string
  icon: Component
}

defineProps<{
  stats: Stat[]
  iconColor?: string
}>()
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

:deep(.n-statistic-label) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

:deep(.n-statistic-value) {
  font-size: 1.5rem;
  font-weight: bold;
}

:deep(.n-icon) {
  margin-right: 8px;
}
</style>
