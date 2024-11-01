<template>
  <div class="link-list">
    <InteractiveFilterBar
      :filter-options="filterOptions"
      :quick-filters="quickFilters"
      @apply="applyFilters"
    />
    <n-flex justify="flex-end">
      <n-button size="small" @click="clearSorter" :disabled="!hasSorter" round> 取消排序 </n-button>
    </n-flex>
    <n-data-table
      remote
      ref="table"
      :columns="columns"
      :data="links"
      :loading="loading"
      :pagination="pagination"
      :bordered="false"
      :single-line="true"
      :scroll-x="1800"
      :row-key="(row) => row.id"
      @update:sorter="handleSorterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref, watchEffect, useTemplateRef } from 'vue'
import { useLinksStore } from '@/stores/links'
import {
  NDataTable,
  NTag,
  NButton,
  NSpace,
  NText,
  NFlex,
  type DataTableSortState,
  type DataTableColumns,
  type PaginationProps,
  type DataTableInst,
} from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getExpirationTagType, formatDateTime } from '@/utils/dateUtils'
import dayjs from 'dayjs'
import type { Filter, FilterOption } from './InteractiveFilterBar.vue'
import InteractiveFilterBar from './InteractiveFilterBar.vue'
import type { Link, SortParams } from '@/types'
import { storeToRefs } from 'pinia'

const linksStore = useLinksStore()
const { links, loading, currentPage, pageSize, total, totalPages } = storeToRefs(linksStore)
const message = useMessage()
const tableRef = useTemplateRef<DataTableInst>('table')

const columns = computed<DataTableColumns<Link>>(() => [
  {
    title: '短链接',
    key: 'shortUrl',
    render(row: Link) {
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
    width: 250,
  },
  {
    title: '原始链接',
    key: 'originalUrl',
    ellipsis: {
      tooltip: true,
    },
    width: 400,
  },
  {
    title: '访问次数',
    key: 'visits',
    sorter: true,
    render(row: Link) {
      return h(NTag, { type: 'info', bordered: false }, { default: () => row.visits || 0 })
    },
  },
  {
    title: '过期日期',
    key: 'expiresAt',
    sorter: true,
    render(row: Link) {
      return h(
        NTag,
        {
          bordered: false,
          type: getExpirationTagType(row.expiresAt),
        },
        { default: () => (row.expiresAt ? formatDateTime(row.expiresAt) : '未设置') }
      )
    },
  },
  {
    title: '是否自定义',
    key: 'isCustom',
    render(row: Link) {
      return h(
        NTag,
        {
          type: row.isCustom ? 'success' : 'default',
          bordered: false,
        },
        { default: () => (row.isCustom ? '是' : '否') }
      )
    },
  },
  {
    title: '创建日期',
    key: 'createdAt',
    defaultSortOrder: 'descend',
    sorter: true,
    render(row: Link) {
      return row.createdAt ? formatDateTime(row.createdAt) : '--'
    },
  },
  {
    title: '更新日期',
    key: 'updatedAt',
    sorter: true,
    render(row: Link) {
      return row.updatedAt ? formatDateTime(row.updatedAt) : '--'
    },
  },
  {
    title: '操作',
    key: 'actions',
    render(row: Link) {
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
                'aria-label': '复制短链接',
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
                      'aria-label': '查看分析数据',
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
])

// 分页事件处理
const paginationHandlers = {
  onChange: (page: number) => {
    linksStore.setPage(page)
  },
  onUpdatePageSize: (pageSize: number) => {
    linksStore.setPageSize(pageSize)
  },
} as const

// 分页的动态部分
const pagination = computed<PaginationProps>(() => ({
  page: currentPage.value,
  pageCount: totalPages.value,
  pageSize: pageSize.value,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: ({ itemCount }) => `共 ${itemCount} 条`,
  ...paginationHandlers,
}))

const filterParams = ref<Record<string, any>>({})

const sorters = ref<SortParams>({ createdAt: 'desc' })

const hasSorter = computed(() => Object.keys(sorters.value).length > 0)

const handleSorterChange = async (sorter: DataTableSortState) => {
  if (!sorter || Object.keys(sorter).length === 0) {
    // 重置排序
    sorters.value = {}
  } else {
    const { columnKey, order } = sorter as { columnKey: string; order: 'ascend' | 'descend' }
    const sortOrder = order === 'ascend' ? 'asc' : 'desc'
    const sort = { [columnKey]: sortOrder } as SortParams
    sorters.value = sort
  }
  linksStore.setPage(1)
}

const clearSorter = () => {
  sorters.value = {}
  linksStore.setPage(1)
  tableRef.value?.clearSorter()
}

const query = async ({
  sort,
  filters,
}: {
  sort?: SortParams
  filters?: Record<string, any>
} = {}): Promise<void> => {
  try {
    const params = {
      sort,
      ...filters,
    }
    await linksStore.fetchLinks(params)
  } catch (error) {
    console.error('Failed to fetch links:', error)
  }
}

const filterOptions: FilterOption[] = [
  {
    label: '短链接',
    value: 'shortUrl',
    type: 'string',
  },
  {
    label: '原始链接',
    value: 'originalUrl',
    type: 'string',
  },
  {
    label: '访问次数',
    value: 'visits',
    type: 'number',
  },
  {
    label: '过期日期',
    value: 'expiresAt',
    type: 'date',
  },
  { label: '是否自定义', value: 'isCustom', type: 'boolean' },
  {
    label: '创建日期',
    value: 'createdAt',
    type: 'date',
  },
  {
    label: '更新日期',
    value: 'updatedAt',
    type: 'date',
  },
]

const quickFilters = [
  {
    label: '已过期',
    value: 'expired',
    filter: { field: 'expiresAt', operator: 'lessThan', value: dayjs().valueOf() },
  },
  {
    label: '即将过期',
    value: 'expiring_soon',
    filter: {
      field: 'expiresAt',
      operator: 'greaterThan',
      value: dayjs().add(3, 'day').valueOf(),
    },
  },
  {
    label: '自定义链接',
    value: 'custom',
    filter: { field: 'isCustom', operator: 'equals', value: true },
  },
]

const applyFilters = async (filters: Filter[]) => {
  const queryParams: Record<string, any> = {}

  filters.forEach((filter) => {
    const { field, operator, value } = filter
    let queryKey = field

    switch (operator) {
      case 'equals':
        queryKey += '_eq'
        break
      case 'notEquals':
        queryKey += '_ne'
        break
      case 'contains':
        queryKey += '_like'
        break
      case 'startsWith':
        queryKey += '_likeLeft'
        break
      case 'endsWith':
        queryKey += '_likeRight'
        break
      case 'notContains':
        queryKey += '_not_like'
        break
      case 'greaterThan':
        queryKey += '_gt'
        break
      case 'lessThan':
        queryKey += '_lt'
        break
      case 'greaterThanOrEqual':
        queryKey += '_ge'
        break
      case 'lessThanOrEqual':
        queryKey += '_le'
        break
      default:
        console.warn(`Unsupported operator: ${operator}`)
        return
    }

    queryParams[queryKey] = value
  })

  linksStore.setPage(1)
  filterParams.value = queryParams
}

watchEffect(
  async () =>
    await query({
      sort: sorters.value,
      filters: filterParams.value,
    })
)

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      message.success('短链接已复制到剪贴板')
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
      message.error('复制失败，请重试')
    })
}
</script>
<style scoped>
.link-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.n-form-item-label) {
  display: flex;
  align-items: center;
  height: 100%;
}

:deep(.n-data-table) {
  --n-merged-th-color: var(--n-color);
  --n-merged-td-color: var(--n-color);
}

:deep(.n-button) {
  transition: all 0.3s ease;
}

:deep(.n-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.n-button[disabled]:hover) {
  transform: none;
}
</style>
