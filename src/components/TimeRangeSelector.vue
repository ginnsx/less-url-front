<template>
  <n-flex>
    <n-select
      :value="selectedTimeRange"
      :options="timeRangeOptions"
      size="medium"
      :consistent-menu-width="false"
      placement="bottom-end"
      class="time-range-select"
      @update:value="handleTimeRangeChange"
    />
    <n-modal
      v-model:show="showDatePicker"
      title="选择时间范围"
      :mask-closable="false"
      preset="card"
      transform-origin="center"
      class="custom-modal"
      size="large"
      :bordered="false"
      :segmented="{
        content: 'soft',
      }"
    >
      <n-date-picker
        panel
        v-model:value="tempDateRange"
        type="daterange"
        size="large"
        update-value-on-close
        :is-date-disabled="disableFutureDates"
        :clearable="false"
        :actions="null"
        style="background-color: transparent"
      />
      <template #footer>
        <n-flex justify="end">
          <n-button size="small" @click="handleModalCancel">取消</n-button>
          <n-button size="small" type="primary" @click="handleModalConfirm">确定</n-button>
        </n-flex>
      </template>
    </n-modal>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NSelect, NDatePicker, NModal, NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useAnalysisStore, type TimeRangeType } from '@/stores/analysis'
import dayjs from 'dayjs'

const analysisStore = useAnalysisStore()
const { selectedTimeRange, timeRange } = storeToRefs(analysisStore)

const showDatePicker = ref(false)
const tempDateRange = ref<[number, number]>(timeRange.value)

// 添加一个计算属性来处理自定义日期范围的显示
const timeRangeLabel = computed(() => {
  if (selectedTimeRange.value === 'custom' && timeRange.value) {
    const [start, end] = timeRange.value
    return `${dayjs(start).format('YYYY-MM-DD')} 至 ${dayjs(end).format('YYYY-MM-DD')}`
  }
  return undefined
})

const timeRangeOptions = computed(() => [
  { label: '小时', value: 'hour', disabled: true },
  { label: '今天', value: 'today' },
  { label: '最近24小时', value: 'last24h' },
  { label: '天', value: 'day', disabled: true },
  { label: '本周', value: 'thisWeek' },
  { label: '最近7天', value: 'last7d' },
  { label: '月', value: 'month', disabled: true },
  { label: '本月', value: 'thisMonth' },
  { label: '最近30天', value: 'last30d' },
  { label: '最近90天', value: 'last90d' },
  { label: '任意时间', value: 'anytime', disabled: true },
  {
    label: selectedTimeRange.value === 'custom' ? timeRangeLabel.value : '自定义',
    value: 'custom',
  },
])

const getTimeRange = (range: string): [number, number] => {
  const now = dayjs()
  switch (range) {
    case 'today':
      return [now.startOf('day').valueOf(), now.endOf('day').valueOf()]
    case 'last24h':
      return [now.subtract(24, 'hour').valueOf(), now.valueOf()]
    case 'thisWeek':
      return [now.startOf('week').valueOf(), now.endOf('week').valueOf()]
    case 'last7d':
      return [now.subtract(6, 'day').startOf('day').valueOf(), now.endOf('day').valueOf()]
    case 'thisMonth':
      return [now.startOf('month').valueOf(), now.endOf('month').valueOf()]
    case 'last30d':
      return [now.subtract(29, 'day').startOf('day').valueOf(), now.endOf('day').valueOf()]
    case 'last90d':
      return [now.subtract(89, 'day').startOf('day').valueOf(), now.endOf('day').valueOf()]
    default:
      return [now.startOf('day').valueOf(), now.endOf('day').valueOf()]
  }
}

const disableFutureDates = (ts: number) => {
  return ts > dayjs().valueOf()
}

const handleTimeRangeChange = (value: string) => {
  if (value === 'custom') {
    tempDateRange.value = timeRange.value
    showDatePicker.value = true
  } else {
    const [start, end] = getTimeRange(value)
    analysisStore.updateTimeRange(value as TimeRangeType, start, end)
  }
}

const handleModalConfirm = () => {
  if (tempDateRange.value) {
    const [start, end] = tempDateRange.value
    analysisStore.updateTimeRange('custom', start, end)
  }
  showDatePicker.value = false
}

const handleModalCancel = () => {
  if (selectedTimeRange.value === 'custom' && !timeRange.value) {
    analysisStore.updateTimeRange('last7d', ...getTimeRange('last7d'))
  }
  showDatePicker.value = false
}
</script>

<style scoped>
.custom-modal {
  width: 600px;
}

.time-range-select {
  min-width: 120px;
}
</style>
