<template>
  <div class="link-list">
    <n-data-table
      :columns="columns"
      :data="links"
      :pagination="pagination"
      @update:page="handlePageChange"
      :bordered="false"
      :single-line="true"
      :scroll-x="1600"
    />
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref, onMounted } from 'vue'
import { useLinksStore } from '@/stores/links'
import {
  NDataTable,
  type DataTableColumns,
  type PaginationProps,
  NTag,
  NButton,
  NSpace,
  NText,
} from 'naive-ui'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'
import type { Link } from '@/stores/links'
import { useMessage } from 'naive-ui'

const linksStore = useLinksStore()
onMounted(async () => {
  await linksStore.fetchLinks()
})

const columns: DataTableColumns<Link> = [
  {
    title: '短链接',
    key: 'shortUrl',
    render(row) {
      return h(
        RouterLink,
        {
          to: `/analytics/${row.id}`,
        },
        {
          default: () =>
            h(
              NText,
              {
                type: 'primary',
                style: 'text-decoration: underline;',
              },
              { default: () => row.shortUrl }
            ),
        }
      )
    },
    fixed: 'left',
  },
  {
    title: '原始链接',
    key: 'longUrl',
    ellipsis: {
      tooltip: true,
    },
    width: 400,
  },
  {
    title: '点击次数',
    key: 'clicks',
    render(row) {
      return h(NTag, { type: 'info', bordered: false }, { default: () => row.clicks })
    },
  },
  {
    title: '过期日期',
    key: 'expiresAt',
    render(row) {
      return dayjs(row.expiresAt).format('YYYY-MM-DD HH:mm')
    },
  },
  {
    title: '创建日期',
    key: 'createdAt',
    render(row) {
      return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm')
    },
  },
  {
    title: '更新日期',
    key: 'updatedAt',
    render(row) {
      return dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm')
    },
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => {
                  copyToClipboard(row.shortUrl)
                },
              },
              { default: () => '复制' }
            ),
            h(
              RouterLink,
              {
                to: `/analytics/${row.id}`,
              },
              {
                default: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                    },
                    { default: () => '分析' }
                  ),
              }
            ),
          ],
        }
      )
    },
    fixed: 'right',
  },
]

const pagination = ref<PaginationProps>({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
})

const links = computed(() => linksStore.links)

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const message = useMessage()

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('短链接已复制到剪贴板')
  })
}
</script>
