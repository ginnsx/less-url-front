<template>
  <n-card title="地理分布">
    <div class="geo-container">
      <!-- 左侧世界地图 -->
      <WorldMap :data="currentTabData" />

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
import { ref, computed } from 'vue'
import MetricsGroup from '@/components/MetricsGroup.vue'
import WorldMap from '@/components/WorldMap.vue'
import { NCard } from 'naive-ui'

// 定义标签页
const tabs = [
  { key: 'country', label: '国家' },
  { key: 'region', label: '地区' },
  { key: 'city', label: '城市' },
]

// Mock 数据 - 实际项目中应该从 API 获取
const mockData = [
  {
    country: 'United States',
    count: 59,
  },
  {
    country: 'China',
    count: 40,
  },
  {
    country: 'Local Network',
    count: 27,
  },
  {
    country: 'Bulgaria',
    count: 20,
  },
  {
    country: 'Austria',
    count: 10,
  },
  {
    country: 'Nicaragua',
    count: 10,
  },
  {
    country: 'France',
    count: 10,
  },
  {
    country: 'The Netherlands',
    count: 10,
  },
  {
    country: 'Brazil',
    count: 10,
  },
  {
    country: 'Chile',
    count: 10,
  },
  {
    country: 'Ireland',
    count: 10,
  },
  {
    country: 'Egypt',
    count: 10,
  },
  {
    country: 'Sri Lanka',
    count: 10,
  },
]

const currentTab = ref('country')

// 计算当前标签页的数据
const currentTabData = computed(() => {
  return mockData.map((item) => ({ name: item.country, value: item.count })) || []
})

// 处理标签页切换
const handleTabChange = (key: string) => {
  currentTab.value = key
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
