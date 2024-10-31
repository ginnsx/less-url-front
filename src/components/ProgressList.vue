<template>
  <div class="progress-list">
    <div v-for="item in processedData" :key="item.name" class="progress-item">
      <div class="progress-label">
        <span>{{ item.name }}</span>
        <span>{{ item.value }}</span>
      </div>
      <n-progress
        class="progress-bar"
        type="line"
        :percentage="item.percentage"
        indicator-placement="inside"
        :color="color"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NProgress } from 'naive-ui'

interface DataItem {
  name: string
  value: number
}

interface Props {
  data: DataItem[]
  color?: string
}

const props = defineProps<Props>()

// 计算百分比
const processedData = computed(() => {
  const total = props.data.reduce((sum, item) => sum + item.value, 0)
  return props.data.map((item) => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
  }))
})
</script>

<style scoped>
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  transition: transform 0.3s ease;
}

.progress-bar:hover {
  transform: scale(1.05);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--n-text-color);
}
</style>
