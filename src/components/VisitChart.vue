<template>
  <n-card title="点击量趋势">
    <div ref="chartRef" style="width: 100%; height: 300px"></div>
  </n-card>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import * as echarts from 'echarts'
import { NCard } from 'naive-ui'
import dayjs from 'dayjs'
import { useThemesStore } from '@/stores/themes'
import type { TimeseriesData } from '@/types'

const props = defineProps<{
  data: TimeseriesData[]
}>()

const themesStore = useThemesStore()

const chartRef = ref<HTMLElement>()

const timeseriesData = computed(() => props.data)

const themeName = computed(() => themesStore.themeName)

onMounted(() => {
  const chart = echarts.init(chartRef.value!, themeName.value)

  chart.setOption({
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const date = dayjs(timeseriesData.value[params[0].dataIndex].time).format('YYYY-MM-DD')
        return `${date}<br/>
                访问量: ${params[0].value}<br/>
                访客数: ${params[1].value}`
      },
    },
    legend: {
      data: ['访问量', '访客数'],
    },
    xAxis: {
      type: 'category',
      boundaryGap: false, // 坐标轴两边留白策略
      data: timeseriesData.value.map((item) => dayjs(item.time).format('YYYY-MM-DD')),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '访问量',
        data: timeseriesData.value.map((item) => item.visits),
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
        },
      },
      {
        name: '访客数',
        data: timeseriesData.value.map((item) => item.visitors),
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  })
})
</script>
