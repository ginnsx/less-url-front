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
      :data="datas"
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
import { h, computed, reactive, ref, watchEffect, useTemplateRef } from 'vue'
import { type Link, useLinksStore } from '@/stores/links'
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
import type { SortParams } from '@/api/axiosWrapper'
import dayjs from 'dayjs'
import type { Filter, FilterOption } from '@/components/InteractiveFilterBar.vue'
import InteractiveFilterBar from '@/components/InteractiveFilterBar.vue'

const linksStore = useLinksStore()
const loading = ref(true)
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
    title: '点击次数',
    key: 'clicks',
    sorter: true,
    render(row: Link) {
      return h(NTag, { type: 'info', bordered: false }, { default: () => row.clicks })
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
        { default: () => formatDateTime(row.expiresAt) }
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
    sorter: true,
    render(row: Link) {
      return formatDateTime(row.createdAt)
    },
  },
  {
    title: '更新日期',
    key: 'updatedAt',
    sorter: true,
    render(row: Link) {
      return formatDateTime(row.updatedAt)
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

const pagination = reactive<PaginationProps>({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: ({ itemCount }) => `共 ${itemCount} 条`,
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  },
})

const filterParams = ref<Record<string, any>>({})

const sorters = ref<SortParams>({})

const hasSorter = computed(() => Object.keys(sorters.value).length > 0)

const datas = computed(() => linksStore.links)

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
  pagination.page = 1
}

const clearSorter = () => {
  sorters.value = {}
  pagination.page = 1
  tableRef.value?.clearSorter()
}

const query = async (
  page: number = 1,
  pageSize: number = 10,
  {
    sort,
    filters,
  }: {
    sort?: SortParams
    filters?: Record<string, any>
  } = {}
): Promise<void> => {
  loading.value = true
  try {
    const params = {
      page,
      size: pageSize,
      sort,
      ...filters,
    }
    const links = await linksStore.fetchLinks(params)
    pagination.pageCount = Math.ceil(links.length / pageSize)
    pagination.itemCount = links.length
  } catch (error) {
    console.error('Failed to fetch links:', error)
    message.error('获取链接列表失败，请重试')
  } finally {
    loading.value = false
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
    label: '点击次数',
    value: 'clicks',
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

  pagination.page = 1
  filterParams.value = queryParams
}

watchEffect(
  async () =>
    await query(pagination.page, pagination.pageSize, {
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
