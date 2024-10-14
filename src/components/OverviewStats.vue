<template>
  <div class="overview-stats">
    <n-grid :x-gap="12" :y-gap="8" :cols="4" responsive="screen">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLinksStore } from '@/stores/links'
import { NGrid, NGi, NStatistic, NIcon, NText, NCard, NNumberAnimation } from 'naive-ui'
import { LinkOutline, EyeOutline, TrendingUpOutline, CalendarOutline } from '@vicons/ionicons5'
import dayjs from 'dayjs'

const linksStore = useLinksStore()

const iconColor = '#00b09b'

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
<style scoped>
.overview-stats {
  margin-bottom: 20px;
}

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
