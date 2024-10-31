<template>
  <div class="link-analytics">
    <n-card>
      <template #header>
        <n-flex justify="space-between" align="center">
          <n-flex align="center">
            <n-h2 style="margin: 0">
              <n-text type="default">
                {{ currentLink?.shortUrl }}
              </n-text>
              <n-tag
                class="inline copy-btn"
                :type="copied ? 'success' : 'info'"
                :bordered="false"
                ghost
                size="medium"
                @click.stop="copyToClipboard"
              >
                <template #icon>
                  <n-icon :component="copied ? CheckmarkDoneSharp : CopySharp" />
                </template>
              </n-tag>
            </n-h2>
          </n-flex>
          <n-flex>
            <TimeRangeSelector />
          </n-flex>
        </n-flex>
      </template>
      <n-grid :cols="24" :x-gap="12" :y-gap="12" :item-responsive="true" responsive="screen">
        <n-grid-item span="24">
          <StatisticsCards :stats="linkStats" :icon-color="iconColor" />
        </n-grid-item>
        <n-grid-item span="24">
          <VisitChart />
        </n-grid-item>
        <n-grid-item span="24">
          <GeoDistribution />
        </n-grid-item>
        <n-grid-item span="24 m:12">
          <MetricsGroup title="来源分析" :tabs="sourceTabs" :data="sourceData" />
        </n-grid-item>
        <n-grid-item span="24 m:12">
          <MetricsGroup title="语言分析" :tabs="languageTabs" :data="languageData" />
        </n-grid-item>
        <n-grid-item span="24 m:12">
          <MetricsGroup title="设备分析" :tabs="deviceTabs" :data="deviceData" />
        </n-grid-item>
        <n-grid-item span="24 m:12">
          <MetricsGroup title="平台分析" :tabs="platformTabs" :data="platformData" />
        </n-grid-item>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NH2, NCard, NFlex, NGrid, NText, NTag, NIcon, NGridItem } from 'naive-ui'
import { useMessage } from 'naive-ui'
import {
  CheckmarkDoneSharp,
  CopySharp,
  EyeOutline,
  PeopleOutline,
  LinkOutline,
} from '@vicons/ionicons5'
import { useLinksStore } from '@/stores/links'
import VisitChart from '@/components/VisitChart.vue'
import GeoDistribution from '@/components/GeoDistribution.vue'
import StatisticsCards from '@/components/StatisticsCards.vue'
import MetricsGroup from '@/components/MetricsGroup.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'

const route = useRoute()
const linksStore = useLinksStore()

const currentLink = computed(() => linksStore.currentLink)

onMounted(async () => {
  // const [start, end] = getTimeRange(selectedTimeRange.value)
  // await updateAnalytics(start, end)
})

const copied = ref(false)

const message = useMessage()
const copyToClipboard = () => {
  navigator.clipboard.writeText(currentLink.value?.shortUrl!).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 5000)
    message.success('短链接已复制到剪贴板')
  })
}

const iconColor = '#00b09b'

const linkStats = computed(() => [
  {
    label: '访问次数',
    value: currentLink.value?.visits || 0,
    icon: EyeOutline,
  },
  {
    label: '访问人数',
    value: currentLink.value?.visitors || 0,
    icon: PeopleOutline,
  },
  {
    label: '引用来源',
    value: currentLink.value?.referers || 0,
    icon: LinkOutline,
  },
])

// 更新统计数据
const updateAnalytics = async (start: number, end: number) => {
  try {
    await linksStore.fetchLinkDetails(route.params.id as string, {
      startTime: start,
      endTime: end,
    })
  } catch (error) {
    message.error('获取链接详情失败')
    console.error('Failed to fetch link details:', error)
  }
}

// 来源分析数据
const sourceTabs = [
  {
    key: 'source',
    label: '访问来源',
  },
]

const sourceData = [
  { name: '直接访问', value: 500 },
  { name: '搜索引擎', value: 300 },
  { name: '社交媒体', value: 200 },
]

// 语言分析数据
const languageTabs = [
  {
    key: 'language',
    label: '使用语言',
  },
  {
    key: 'timezone',
    label: '时区分布',
  },
]

const languageData = [
  { name: '简体中文', value: 800 },
  { name: '英语', value: 400 },
  { name: '日语', value: 200 },
]

// 设备分析数据
const deviceTabs = [
  {
    key: 'type',
    label: '设备类型',
  },
  {
    key: 'brand',
    label: '设备品牌',
  },
  {
    key: 'model',
    label: '设备型号',
  },
]

const deviceData = [
  { name: '手机', value: 1000 },
  { name: '平板', value: 300 },
  { name: '笔记本', value: 500 },
]

// 平台分析数据
const platformTabs = [
  {
    key: 'os',
    label: '操作系统',
  },
  {
    key: 'browser',
    label: '浏览器',
  },
]

const platformData = [
  { name: 'iOS', value: 800 },
  { name: 'Android', value: 600 },
  { name: 'Windows', value: 400 },
]
</script>

<style scoped>
.link-analytics {
  animation: fadeIn 0.5s ease-out;
}

.n-card {
  flex-grow: 1;
}

.copy-btn {
  cursor: pointer;
  background-color: var(--n-color-checkable);
  padding: 0px;
  margin: 0px 0px 0px 10px;
}
</style>
