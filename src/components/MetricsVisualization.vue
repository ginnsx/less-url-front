<template>
  <div>
    <n-grid cols="24" x-gap="12" y-gap="8" :item-responsive="true" responsive="self">
      <n-grid-item span="24">
        <ProgressList :data="limitedData" />
        <div class="view-more">
          <n-button text type="default" @click="showDetailsModal = true" class="view-more-btn">
            <template #icon>
              <n-icon><ScanOutline /></n-icon>
            </template>
            <span class="btn-text">DETAILS</span>
          </n-button>
        </div>
      </n-grid-item>
      <n-grid-item span="24">
        <PieChart ref="pieChartRef" :data="limitedData" :theme="themeName" :height="400" />
      </n-grid-item>
    </n-grid>

    <!-- 详细数据弹窗 -->
    <n-modal
      v-model:show="showDetailsModal"
      preset="card"
      title="详细数据"
      :style="{ width: '600px' }"
    >
      <ProgressList :data="data" />
      <PieChart :data="data" :theme="themeName" :height="400" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NGrid, NGridItem, NButton, NModal, NIcon } from 'naive-ui'
import { useThemesStore } from '@/stores/themes'
import ProgressList from '@/components/ProgressList.vue'
import PieChart from '@/components/PieChart.vue'
import { debounce } from 'lodash-es'
import { ScanOutline } from '@vicons/ionicons5'
import type { MetricsData } from '@/types'

interface Props {
  data: MetricsData[]
}

const props = defineProps<Props>()

// 主题相关
const themesStore = useThemesStore()
const themeName = computed(() => themesStore.themeName)

const pieChartRef = ref()

// 创建防抖的 resize 处理函数
const debouncedResize = debounce(() => {
  pieChartRef.value?.resize()
}, 200)

// 使用防抖后的函数
onMounted(() => {
  window.addEventListener('resize', debouncedResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)
  debouncedResize.cancel() // 清除待执行的防抖函数
})

// 控制详情弹窗显示
const showDetailsModal = ref(false)

// 限制显示前5项数据
const limitedData = computed(() => {
  return props.data.slice(0, 5)
})
</script>

<style scoped>
.view-more {
  display: flex;
  margin-top: 8px;
}

.view-more-btn {
  width: 100%;
  justify-content: center;
  padding: 8px 0;
}

.btn-text {
  position: relative;
  padding: 2px 0;
}

.btn-text::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--n-text-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: center;
}

.view-more-btn:hover .btn-text::after,
.view-more-btn:focus .btn-text::after {
  transform: scaleX(1);
}

:deep(.n-button__content) {
  justify-content: center;
}
</style>
