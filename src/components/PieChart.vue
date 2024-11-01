<template>
  <div ref="chartRef" style="width: 100%" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { useThemesStore } from '@/stores/themes'
import type { MetricsData } from '@/types'

const themesStore = useThemesStore()

interface Props {
  data: MetricsData[]
  theme?: string
  height: number
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement>()
let chart: ECharts | null = null

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: props.data,
      },
    ],
  })
}

const themeName = computed(() => themesStore.themeName)

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value, themeName.value)
  updateChart()
}

watch(
  () => props.data,
  () => updateChart(),
  { deep: true }
)

watch(themeName, () => {
  chart?.dispose()
  initChart()
})

onMounted(() => {
  initChart()
})

defineExpose({
  resize: () => chart?.resize(),
})
</script>
