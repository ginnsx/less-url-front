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

const themesStore = useThemesStore()
const themeName = computed(() => themesStore.themeName)

const chartRef = ref<HTMLElement>()

onMounted(() => {
  const chart = echarts.init(chartRef.value!, themeName.value)
  // Mock 数据
  const mockData = [
    {
      time: 1709308800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1709568000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1709740800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1709827200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1709913600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710000000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710086400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710172800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710259200000,
      visits: 1,
      visitors: 0,
    },
    {
      time: 1710345600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710432000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710518400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710604800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710691200000,
      visits: 1,
      visitors: 0,
    },
    {
      time: 1710777600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710864000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1710950400000,
      visits: 1,
      visitors: 0,
    },
    {
      time: 1711036800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711123200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711209600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711296000000,
      visits: 2,
      visitors: 1,
    },
    {
      time: 1711382400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711468800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711555200000,
      visits: 2,
      visitors: 2,
    },
    {
      time: 1711641600000,
      visits: 2,
      visitors: 2,
    },
    {
      time: 1711728000000,
      visits: 2,
      visitors: 2,
    },
    {
      time: 1711814400000,
      visits: 2,
      visitors: 2,
    },
    {
      time: 1711900800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1711987200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712073600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712160000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712246400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712332800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712419200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712505600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712592000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712678400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712764800000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712851200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1712937600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1713024000000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1713110400000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1713196800000,
      visits: 1,
      visitors: 0,
    },
    {
      time: 1713283200000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1713369600000,
      visits: 1,
      visitors: 1,
    },
    {
      time: 1713456000000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1713542400000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1713628800000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1713715200000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1713801600000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1713888000000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1713974400000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714060800000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1714147200000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1714233600000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714320000000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714406400000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714492800000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1714579200000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1714665600000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714752000000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1714838400000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1714924800000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1715011200000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715097600000,
      visits: 5,
      visitors: 4,
    },
    {
      time: 1715184000000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715270400000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1715356800000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715443200000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715529600000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1715616000000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715702400000,
      visits: 5,
      visitors: 4,
    },
    {
      time: 1715788800000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715875200000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1715961600000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716048000000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1716134400000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1716220800000,
      visits: 4,
      visitors: 2,
    },
    {
      time: 1716307200000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1716393600000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716480000000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716566400000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716652800000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716739200000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1716825600000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1716912000000,
      visits: 5,
      visitors: 3,
    },
    {
      time: 1716998400000,
      visits: 4,
      visitors: 3,
    },
    {
      time: 1717084800000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1717171200000,
      visits: 3,
      visitors: 3,
    },
    {
      time: 1717257600000,
      visits: 4,
      visitors: 4,
    },
    {
      time: 1717344000000,
      visits: 4,
      visitors: 3,
    },
  ]

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
        const date = dayjs(mockData[params[0].dataIndex].time).format('YYYY-MM-DD')
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
      data: mockData.map((item) => dayjs(item.time).format('YYYY-MM-DD')),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '访问量',
        data: mockData.map((item) => item.visits),
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
        },
      },
      {
        name: '访客数',
        data: mockData.map((item) => item.visitors),
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
