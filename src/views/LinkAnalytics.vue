<template>
  <div class="link-analytics">
    <n-card>
      <template #header>
        <n-h2>
          <span>链接分析: </span>
          <n-gradient-text :size="24" type="success">
            {{ currentLink?.shortUrl }}
          </n-gradient-text>
        </n-h2>
      </template>
      <n-flex vertical size="large">
        <n-descriptions bordered>
          <n-descriptions-item label="原始链接">
            <n-ellipsis style="max-width: 500px">
              {{ currentLink?.originalUrl }}
            </n-ellipsis>
          </n-descriptions-item>
          <n-descriptions-item label="总点击次数">
            {{ currentLink?.clicks }}
          </n-descriptions-item>
          <n-descriptions-item label="创建日期">
            {{ formatDate(currentLink?.createdAt) }}
          </n-descriptions-item>
        </n-descriptions>
        <!-- <ClicksChart /> -->
        <n-grid :x-gap="12" :y-gap="8" :cols="2">
          <n-gi>
            <!-- <GeoDistribution /> -->
          </n-gi>
          <n-gi>
            <!-- <DeviceTypes /> -->
          </n-gi>
        </n-grid>
      </n-flex>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLinksStore } from '@/stores/links'
import {
  NH2,
  NCard,
  NFlex,
  NDescriptions,
  NDescriptionsItem,
  NEllipsis,
  NGrid,
  NGi,
  NGradientText,
} from 'naive-ui'
// import ClicksChart from "@/components/ClicksChart.vue";
// import GeoDistribution from "@/components/GeoDistribution.vue";
// import DeviceTypes from "@/components/DeviceTypes.vue";
import { formatDateTime } from '@/utils/dateUtils'

const route = useRoute()
const linksStore = useLinksStore()

const currentLink = computed(() => linksStore.currentLink)

const formatDate = (date: number | undefined) => {
  return date ? formatDateTime(date) : '-'
}

onMounted(async () => {
  await linksStore.fetchLinkDetails(route.params.id as string)
})
</script>

<style scoped>
.link-analytics {
  max-width: 1000px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
}

.n-card {
  flex-grow: 1;
}
</style>
