<template>
  <n-grid :x-gap="12" :y-gap="8" :cols="4">
    <n-gi v-for="stat in stats" :key="stat.label">
      <n-statistic :label="stat.label" tabular-nums>
        <template #prefix>
          <n-icon :component="stat.icon" />
        </template>
        <n-number-animation show-separator v-if="typeof stat.value === 'number'" :to="stat.value" />
        <n-text v-else>{{ stat.value }}</n-text>
      </n-statistic>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLinksStore } from '@/stores/links'
import { NGrid, NGi, NStatistic, NIcon, NText, NNumberAnimation } from 'naive-ui'
import { LinkOutline, EyeOutline, TrendingUpOutline, CalendarOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const linksStore = useLinksStore()

const stats = computed(() => [
  {
    label: '总链接数',
    value: linksStore.links.length,
    icon: LinkOutline,
  },
  {
    label: '总点击数',
    value: linksStore.links.reduce((sum, link) => sum + link.clicks, 0),
    icon: EyeOutline,
  },
  {
    label: '平均点击数',
    value: (
      linksStore.links.reduce((sum, link) => sum + link.clicks, 0) / linksStore.links.length || 0
    ).toFixed(2),
    icon: TrendingUpOutline,
  },
  {
    label: '最近创建',
    value:
      linksStore.links.length > 0
        ? dayjs(Math.max(...linksStore.links.map((l) => l.createdAt))).format('YYYY-MM-DD')
        : '-',
    icon: CalendarOutline,
  },
])
</script>
