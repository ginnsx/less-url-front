<template>
  <n-card title="地理分布">
    <div class="geo-container">
      <!-- 左侧世界地图 -->
      <WorldMap :data="countryMetricsData" />

      <!-- 右侧统计数据 -->
      <div class="metrics-container">
        <MetricsGroup
          title="访问分布"
          :tabs="tabs"
          :data="currentTabData"
          @tab-change="handleTabChange"
        />
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MetricsGroup from './MetricsGroup.vue'
import WorldMap from './WorldMap.vue'
import { NCard } from 'naive-ui'
import type { LocationData } from '@/types'

const props = defineProps<{
  tabs: { key: string; label: string }[]
  countryData: LocationData[]
  locationData: LocationData[]
}>()

const emit = defineEmits<{
  (e: 'tab-change', key: string): void
}>()

const currentTab = ref<'country' | 'region' | 'city'>('country')

const countryMetricsData = computed(() => {
  return props.locationData.map((item) => ({ name: item.country, value: item.value }))
})

const currentTabData = computed(() => {
  return props.locationData
    .filter((item) => item[currentTab.value])
    .map((item) => ({
      name: item[currentTab.value]!,
      value: item.value,
    }))
})

const handleTabChange = (key: string) => {
  currentTab.value = key as 'country' | 'region' | 'city'
  emit('tab-change', key)
}
</script>

<style scoped>
.geo-container {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

.map-container {
  flex: 1;
  min-height: 600px;
}

.metrics-container {
  width: 400px;
}
</style>
