<template>
  <div class="link-analytics">
    <n-card>
      <template #header>
        <n-h2>
          <!-- <span>链接分析: </span> -->
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
import { onMounted, computed, ref } from 'vue'
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
  NText,
  NTag,
  NIcon,
} from 'naive-ui'
// import ClicksChart from "@/components/ClicksChart.vue";
// import GeoDistribution from "@/components/GeoDistribution.vue";
// import DeviceTypes from "@/components/DeviceTypes.vue";
import { formatDateTime } from '@/utils/dateUtils'
import { CheckmarkDoneSharp, CopySharp } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const route = useRoute()
const linksStore = useLinksStore()

const currentLink = computed(() => linksStore.currentLink)

const formatDate = (date: number | undefined) => {
  return date ? formatDateTime(date) : '-'
}

onMounted(async () => {
  await linksStore.fetchLinkDetails(route.params.id as string)
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
