<template>
  <n-card title="点击量趋势">
    <div ref="chartRef" style="width: 100%; height: 400px"></div>
  </n-card>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { NCard } from 'naive-ui'
import dayjs from 'dayjs'
import { useThemesStore } from '@/stores/themes'
import { useAnalysisStore } from '@/stores/analysis'
import type { TimeseriesData } from '@/types'

const props = defineProps<{
  data: TimeseriesData[]
}>()

// 核心数据处理
const sortedData = computed(() =>
  props.data.filter((item) => item.time <= Date.now()).sort((a, b) => a.time - b.time)
)

// 状态管理
const themesStore = useThemesStore()
const analysisStore = useAnalysisStore()
const isDay = computed(() => analysisStore.timeUnitType === 'day')

// 图表相关
const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 图表配置
const getChartOption = () => ({
  backgroundColor: 'transparent',
  grid: {
    top: '10%',
    right: '4%',
    bottom: '10%',
    left: '3%',
    containLabel: true,
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any[]) => {
      const item = sortedData.value[params[0].dataIndex]
      const time = dayjs(item.time).format(isDay.value ? 'YYYY-MM-DD' : 'DD HH:mm')
      return `${time}<br/>访问量: ${item.visits}<br/>访客数: ${item.visitors}`
    },
  },
  legend: {
    data: ['访问量', '访客数'],
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: sortedData.value.map((item) =>
      dayjs(item.time).format(isDay.value ? 'YYYY-MM-DD' : 'DD HH:mm')
    ),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.3 },
      data: sortedData.value.map((item) => item.visits),
    },
    {
      name: '访客数',
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.3 },
      data: sortedData.value.map((item) => item.visitors),
    },
  ],
})

// 图表渲染
const renderChart = () => {
  if (!chartRef.value) return

  chart?.dispose()
  chart = echarts.init(chartRef.value, themesStore.themeName)
  chart.setOption(getChartOption())
}

// 事件监听
onMounted(() => {
  renderChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})

// 响应变化
watch([() => props.data, () => themesStore.themeName, isDay], renderChart)
</script>
