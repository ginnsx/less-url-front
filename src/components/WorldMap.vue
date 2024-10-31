<template>
  <div class="map-container" ref="mapRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import worldJson from '@/assets/world.json'

interface MapData {
  name: string
  value: number
}

const props = defineProps<{
  data: MapData[]
}>()

const mapRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 初始化地图配置
const initChart = () => {
  if (!mapRef.value) return

  echarts.registerMap('world', worldJson as any)
  chart = echarts.init(mapRef.value)

  updateChartOption()

  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

// 更新图表配置
const updateChartOption = () => {
  if (!chart) return

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>数值: {c}',
      borderWidth: 1,
      padding: [5, 10],
    },
    visualMap: {
      left: 'right',
      min: 0,
      max: 100,
      text: ['高', '低'],
      calculable: true,
    },
    series: [
      {
        type: 'map',
        map: 'world',
        roam: true,
        zoom: 1.2,
        scaleLimit: {
          min: 1,
          max: 5,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            // color: '#333',
            fontSize: 12,
          },
          itemStyle: {
            areaColor: '#69c0ff',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        itemStyle: {
          areaColor: '#e6e6e6',
          borderColor: '#ffffff',
          borderWidth: 1,
        },
        data: props.data,
      },
    ],
  })
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChartOption()
  }
)

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
