<template>
  <n-card title="地理分布">
    <div class="geo-container" :class="{ mobile: isMobile }">
      <!-- 切换视图按钮（仅在移动端显示） -->
      <div v-if="isMobile" class="view-toggle">
        <n-radio-group v-model:value="currentView" size="small">
          <n-radio-button value="map">地图视图</n-radio-button>
          <n-radio-button value="stats">数据视图</n-radio-button>
        </n-radio-group>
      </div>

      <!-- 世界地图 -->
      <div class="map-container" v-show="!isMobile || currentView === 'map'">
        <WorldMap :data="countryMetricsData" :height="isMobile ? 400 : 600" />
      </div>

      <!-- 统计数据 -->
      <div class="metrics-container" v-show="!isMobile || currentView === 'stats'">
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
import { NCard, NRadioGroup, NRadioButton } from 'naive-ui'
import { useWindowSize } from '@vueuse/core'
import MetricsGroup from './MetricsGroup.vue'
import WorldMap from './WorldMap.vue'
import type { LocationData } from '@/types'

const props = defineProps<{
  tabs: { key: string; label: string }[]
  countryData: LocationData[]
  locationData: LocationData[]
}>()

const emit = defineEmits<{
  (e: 'tab-change', key: string): void
}>()

// 响应式相关
const { width } = useWindowSize()
const isMobile = computed(() => width.value <= 768)
const currentView = ref<'map' | 'stats'>('map')

const currentTab = ref<'country' | 'region' | 'city'>('country')

const countryMetricsData = computed(() => {
  return props.locationData.map((item) => ({
    name: item.country,
    value: item.value,
  }))
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

.view-toggle {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

/* 移动端样式 */
@media screen and (max-width: 768px) {
  .geo-container {
    flex-direction: column;
    min-height: auto;
    gap: 16px;
  }

  .map-container {
    min-height: 400px;
    width: 100%;
  }

  .metrics-container {
    width: 100%;
  }

  /* 添加过渡效果 */
  .map-container,
  .metrics-container {
    transition: opacity 0.3s ease;
  }

  .map-container:not(:visible),
  .metrics-container:not(:visible) {
    display: none;
    opacity: 0;
  }

  .map-container:visible,
  .metrics-container:visible {
    display: block;
    opacity: 1;
  }
}

:deep(.n-radio-group) {
  background-color: var(--n-color);
}

:deep(.n-radio-button) {
  border-color: var(--n-border-color);
}
</style>
