<template>
  <n-card :title="title">
    <n-tabs v-model:value="activeTab" type="line" class="data-tabs" @update:value="handleTabChange">
      <n-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :tab="tab.label">
        <MetricsVisualization :data="data" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NTabs, NTabPane } from 'naive-ui'
import MetricsVisualization from '@/components/MetricsVisualization.vue'

interface DataItem {
  name: string
  value: number
}

interface TabItem {
  key: string
  label: string
}

interface Props {
  title: string
  tabs: TabItem[]
  data: DataItem[]
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  (e: 'update:tab', key: string): void
  (e: 'tab-change', key: string, tab: TabItem): void
}>()

// 当前激活的标签页
const activeTab = ref(props.tabs[0]?.key || '')

// 处理标签页切换
const handleTabChange = (key: string) => {
  const tab = props.tabs.find((t) => t.key === key)
  if (tab) {
    emit('update:tab', key) // 支持 v-model:tab
    emit('tab-change', key, tab) // 提供完整的 tab 信息
  }
}
</script>

<style scoped>
.data-tabs {
  min-height: 500px;
}

:deep(.n-tab-pane) {
  transition: opacity 0.3s ease;
}
</style>
