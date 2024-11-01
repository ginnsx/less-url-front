<template>
  <div class="link-analytics">
    <n-card>
      <template #header>
        <n-flex justify="space-between" align="center">
          <n-flex align="center">
            <n-h2 style="margin: 0">
              <n-text type="default">
                {{ currentLink?.shortUrl || '' }}
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
        <n-grid-item span="24" v-if="timeseriesData.length > 0">
          <VisitChart :data="timeseriesData" />
        </n-grid-item>
        <n-grid-item span="24" v-if="locationData.length > 0">
          <GeoDistribution
            :tabs="locationTabs"
            :country-data="countryData"
            :location-data="locationData"
            @tab-change="(key) => (locationType = key as 'country' | 'region' | 'city')"
          />
        </n-grid-item>
        <n-grid-item span="24 m:12" v-if="referrerData.length > 0">
          <MetricsGroup
            title="来源分析"
            :tabs="referrerTabs"
            :data="referrerData"
            @tab-change="(key) => (referrerType = key as 'referer' | 'referer_type')"
          />
        </n-grid-item>
        <n-grid-item span="24 m:12" v-if="languageData.length > 0">
          <MetricsGroup
            title="语言分析"
            :tabs="languageTabs"
            :data="languageData"
            @tab-change="(key) => (languageType = key as 'language' | 'timezone')"
          />
        </n-grid-item>
        <n-grid-item span="24 m:12" v-if="deviceData.length > 0">
          <MetricsGroup
            title="设备分析"
            :tabs="deviceTabs"
            :data="deviceData"
            @tab-change="(key) => (deviceType = key as 'device_type' | 'brand' | 'device')"
          />
        </n-grid-item>
        <n-grid-item span="24 m:12" v-if="platformData.length > 0">
          <MetricsGroup
            title="平台分析"
            :tabs="platformTabs"
            :data="platformData"
            @tab-change="(key) => (platformType = key as 'os' | 'browser')"
          />
        </n-grid-item>
      </n-grid>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
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
import { useAnalysisStore } from '@/stores/analysis'
import VisitChart from '@/components/VisitChart.vue'
import GeoDistribution from '@/components/GeoDistribution.vue'
import StatisticsCards from '@/components/StatisticsCards.vue'
import MetricsGroup from '@/components/MetricsGroup.vue'
import TimeRangeSelector from '@/components/TimeRangeSelector.vue'
import type { Link, LocationData, BasicData, TimeseriesData, MetricsData } from '@/types'

const message = useMessage()
const route = useRoute()
const linksStore = useLinksStore()
const analysisStore = useAnalysisStore()

const basicData = ref<BasicData | null>(null)
const timeseriesData = ref<TimeseriesData[]>([])

const locationType = ref<'country' | 'region' | 'city'>('country')
const locationData = ref<LocationData[]>([])
const countryData = ref<LocationData[]>([])

const referrerType = ref<'referer' | 'referer_type'>('referer')
const referrerData = ref<MetricsData[]>([])

const languageType = ref<'language' | 'timezone'>('language')
const languageData = ref<MetricsData[]>([])

const deviceType = ref<'device_type' | 'brand' | 'device'>('device')
const deviceData = ref<MetricsData[]>([])

const platformType = ref<'os' | 'browser'>('os')
const platformData = ref<MetricsData[]>([])

const currentLink = ref<Link | null>(null)

const shortUrlParam = computed(() => {
  const url = currentLink.value?.shortUrl
  return url ? url.split('/').pop() : undefined
})

onMounted(async () => {
  currentLink.value = await linksStore.fetchLink(route.params.id as string)
  if (shortUrlParam.value && analysisStore.timeRange) {
    await fetchAll()
  }
})

const fetchAll = async () => {
  const [basic, timeseries, location, referrer, language, device, platform] = await Promise.all([
    analysisStore.getBasicData(shortUrlParam.value),
    analysisStore.getTimeseriesData(shortUrlParam.value),
    analysisStore.getLocationData(locationType.value, shortUrlParam.value),
    analysisStore.getMetricsData(referrerType.value, shortUrlParam.value),
    analysisStore.getMetricsData(languageType.value, shortUrlParam.value),
    analysisStore.getMetricsData(deviceType.value, shortUrlParam.value),
    analysisStore.getMetricsData(platformType.value, shortUrlParam.value),
  ])

  basicData.value = basic?.data || null
  timeseriesData.value = timeseries?.data || []
  locationData.value = location?.data || []
  countryData.value = locationData.value
  referrerData.value = referrer?.data || []
  languageData.value = language?.data || []
  deviceData.value = device?.data || []
  platformData.value = platform?.data || []
}

const timeRange = computed(() => analysisStore.timeRange)

watch(timeRange, async () => {
  if (shortUrlParam.value) {
    await fetchAll()
  }
})

watch(locationType, async () => {
  if (shortUrlParam.value) {
    const res = await analysisStore.getLocationData(locationType.value, shortUrlParam.value)
    locationData.value = res?.data || []
  }
})

watch(referrerType, async () => {
  if (shortUrlParam.value) {
    const res = await analysisStore.getMetricsData(referrerType.value, shortUrlParam.value)
    referrerData.value = res?.data || []
  }
})

watch(languageType, async () => {
  if (shortUrlParam.value) {
    const res = await analysisStore.getMetricsData(languageType.value, shortUrlParam.value)
    languageData.value = res?.data || []
  }
})

watch(deviceType, async () => {
  if (shortUrlParam.value) {
    const res = await analysisStore.getMetricsData(deviceType.value, shortUrlParam.value)
    deviceData.value = res?.data || []
  }
})

watch(platformType, async () => {
  if (shortUrlParam.value) {
    const res = await analysisStore.getMetricsData(platformType.value, shortUrlParam.value)
    platformData.value = res?.data || []
  }
})

const iconColor = '#00b09b'

const linkStats = computed(() => [
  {
    label: '访问次数',
    value: basicData.value?.visits || 0,
    icon: EyeOutline,
  },
  {
    label: '访问人数',
    value: basicData.value?.visitors || 0,
    icon: PeopleOutline,
  },
  {
    label: '引用来源',
    value: basicData.value?.referers || 0,
    icon: LinkOutline,
  },
])

const locationTabs = [
  {
    key: 'country',
    label: '国家',
  },
  {
    key: 'region',
    label: '地区',
  },
  {
    key: 'city',
    label: '城市',
  },
]

const referrerTabs = [
  {
    key: 'referer',
    label: '来源',
  },
  {
    key: 'referer_type',
    label: '类型',
  },
]

const languageTabs = [
  {
    key: 'language',
    label: '语言',
  },
  {
    key: 'timezone',
    label: '时区',
  },
]

const deviceTabs = [
  {
    key: 'device',
    label: '型号',
  },

  {
    key: 'brand',
    label: '品牌',
  },
  {
    key: 'device_type',
    label: '类型',
  },
]

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

const copied = ref(false)

const copyToClipboard = () => {
  navigator.clipboard.writeText(currentLink.value?.shortUrl!).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 5000)
    message.success('短链接已复制到剪贴板')
  })
}
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

:deep(.n-card) {
  border-radius: 8px;
  height: 100%;
  transition: all 0.3s ease;
}
</style>
