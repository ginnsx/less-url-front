<template>
  <div class="recent-links">
    <n-h3 class="gradient-text">最近创建的链接</n-h3>
    <n-infinite-scroll v-if="displayedLinks.length" :distance="10" @load="loadMore">
      <n-list hoverable clickable>
        <n-list-item v-for="link in displayedLinks" :key="link.id" @click="toggleExpand(link)">
          <n-thing :content-style="{ margin: '8px 0' }">
            <template #header>
              <n-text class="short-url">{{ link.shortUrl }}</n-text>
            </template>
            <template #header-extra>
              <n-tag type="info" size="small"> 访问次数: {{ link.visits || 0 }} </n-tag>
            </template>
            <template #description>
              <n-ellipsis style="max-width: 400px">
                {{ link.originalUrl }}
              </n-ellipsis>
            </template>
            <template #footer>
              <n-grid :cols="2" :x-gap="16">
                <n-grid-item>
                  <n-flex align="center">
                    <span>过期时间:</span>
                    <n-tag
                      :bordered="false"
                      :type="getExpirationTagType(link.expiresAt)"
                      size="medium"
                    >
                      {{ link.expiresAt ? formatDate(link.expiresAt) : '未设置' }}
                    </n-tag>
                  </n-flex>
                </n-grid-item>
                <n-grid-item>
                  <n-flex align="center">
                    <span> 创建时间:</span>
                    <n-tag
                      :bordered="false"
                      size="medium"
                      style="background-color: var(--n-color-checkable)"
                    >
                      {{ formatDate(link.createdAt) }}
                    </n-tag>
                  </n-flex>
                </n-grid-item>
              </n-grid>
              <n-collapse-transition :show="expandedLinks.includes(link.id)">
                <div class="expanded-content">
                  <n-grid :cols="24" :x-gap="16">
                    <n-grid-item :span="16">
                      <n-flex vertical :size="16">
                        <n-input-group>
                          <n-input-group-label>短链接</n-input-group-label>
                          <n-input :value="link.shortUrl" readonly />
                          <n-button
                            @click.stop="copyToClipboard(link.shortUrl)"
                            class="copy-button"
                          >
                            复制
                          </n-button>
                        </n-input-group>
                        <n-input-group>
                          <n-input-group-label>原始链接</n-input-group-label>
                          <n-input :value="link.originalUrl" readonly />
                          <n-button
                            @click.stop="copyToClipboard(link.originalUrl)"
                            class="copy-button"
                          >
                            复制
                          </n-button>
                        </n-input-group>
                        <n-flex vertical :size="8">
                          <n-flex align="center">
                            <span>更新时间: {{ formatDate(link.updatedAt) }}</span>
                          </n-flex>
                          <n-flex align="center">
                            <span>是否自定义:</span>
                            <n-tag
                              :bordered="false"
                              :type="link.isCustom ? 'success' : 'default'"
                              :style="{
                                backgroundColor: link.isCustom ? '' : 'var(--n-color-checkable)',
                              }"
                            >
                              {{ link.isCustom ? '是' : '否' }}
                            </n-tag>
                          </n-flex>
                          <n-flex vertical align="center">
                            <n-button
                              type="primary"
                              size="large"
                              @click.stop="goToAnalytics(link.id)"
                              class="analytics-button"
                            >
                              查看详细分析
                            </n-button>
                          </n-flex>
                        </n-flex>
                      </n-flex>
                    </n-grid-item>
                    <n-grid-item :span="8">
                      <n-flex vertical align="center" justify="space-between" style="height: 100%">
                        <QRCode :value="link.shortUrl" :size="200" />
                      </n-flex>
                    </n-grid-item>
                  </n-grid>
                </div>
              </n-collapse-transition>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
      <n-flex justify="center">
        <n-spin v-if="loading" size="small" />
        <n-text v-if="noMoreLinks" depth="3">
          {{
            recentLinks.length >= 50
              ? '只显示最近 50 条'
              : `${recentLinks.length} 条链接，没有更多了`
          }}
        </n-text>
      </n-flex>
    </n-infinite-scroll>
    <n-empty v-else description="最近没有创建链接" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLinksStore } from '@/stores/links'
import { useRouter } from 'vue-router'
import {
  NList,
  NListItem,
  NThing,
  NEmpty,
  NH3,
  NTag,
  NEllipsis,
  NButton,
  NFlex,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NCollapseTransition,
  NGrid,
  NGridItem,
  NText,
  NInfiniteScroll,
  NSpin,
} from 'naive-ui'
import { useMessage } from 'naive-ui'
import QRCode from './QRCode.vue'
import { formatDateTime as formatDate, getExpirationTagType } from '@/utils/dateUtils'
import type { Link } from '@/types'

const linksStore = useLinksStore()

const recentLinks = ref<Link[]>([])
const displayCount = ref(5)
const expandedLinks = ref<string[]>([])
const loading = ref(false)

const displayedLinks = computed(() => [...recentLinks.value].slice(0, displayCount.value))

const noMoreLinks = computed(() => displayedLinks.value.length >= recentLinks.value.length)

const loadMore = () => {
  if (loading.value || noMoreLinks.value) return
  loading.value = true
  setTimeout(() => {
    displayCount.value += 5
    loading.value = false
  }, 200)
}

const toggleExpand = (link: { id: string }) => {
  const index = expandedLinks.value.indexOf(link.id)
  if (index === -1) {
    expandedLinks.value.push(link.id)
  } else {
    expandedLinks.value.splice(index, 1)
  }
}

const message = useMessage()

onMounted(async () => {
  recentLinks.value = await linksStore.fetchRecentLinks()
})

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制到剪贴板')
  })
}

const router = useRouter()

const goToAnalytics = (id: string) => {
  router.push({ path: `/analytics/${id}` })
}
</script>

<style scoped>
.expanded-content {
  margin-top: 16px;
}

.recent-links {
  border-radius: 15px;
  animation: fadeIn 0.5s ease-out;
}

.gradient-text {
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.short-url {
  font-size: 1.2rem;
  font-weight: bold;
}

.copy-button,
.analytics-button {
  transition: all 0.3s ease;
}

.copy-button:hover,
.analytics-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

:deep(.n-list-item) {
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

:deep(.n-list-item:hover) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
