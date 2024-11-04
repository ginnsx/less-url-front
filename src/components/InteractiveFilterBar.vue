<template>
  <n-card class="filter-bar">
    <n-flex vertical :size="16">
      <n-flex justify="space-between" align="center">
        <n-flex :wrap="false">
          <n-button
            @click="addFilter"
            class="action-btn add-filter-btn"
            round
            :disabled="!hasMoreFieldOptions"
          >
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            添加过滤条件
          </n-button>
          <n-button
            @click="clearFilters"
            type="error"
            class="action-btn clear-filter-btn"
            round
            :disabled="!hasFilters"
          >
            <template #icon>
              <n-icon><TrashOutline /></n-icon>
            </template>
            清空
          </n-button>
        </n-flex>
        <n-button @click="applyFilters" type="primary" class="action-btn apply-filter-btn" round>
          查询
        </n-button>
      </n-flex>
      <n-flex wrap>
        <n-tag
          v-for="(quickFilter, index) in quickFilters"
          :disabled="unAvailableFilterFields.has(quickFilter.filter.field)"
          :key="index"
          :type="activeQuickFilters.includes(quickFilter.value) ? 'primary' : 'default'"
          @click="handleQuickFilterClick(quickFilter)"
          class="quick-filter-tag"
          round
        >
          {{ quickFilter.label }}
        </n-tag>
      </n-flex>
      <n-flex wrap align="center">
        <n-flex
          v-for="(filter, index) in filters"
          :key="index"
          align="center"
          :wrap="false"
          class="filter-item"
        >
          <n-select
            v-model:value="filter.field"
            :options="filterFieldOptions"
            placeholder="选择字段"
            class="filter-select filter-field"
            @update:value="onFieldChange(index)"
            :show-arrow="false"
          />
          <n-select
            v-model:value="filter.operator"
            :disabled="!filter.field"
            :options="getOperatorOptions(filter.field)"
            placeholder="选择操作符"
            class="filter-select filter-operator"
            align="center"
            :show-arrow="false"
          />
          <component
            :is="getInputComponent(filter.field).component"
            v-model:value="filter.value"
            v-bind="getInputComponent(filter.field).props"
            class="filter-input"
          />
          <n-button @click="removeFilter(index)" quaternary class="remove-filter-btn">
            <template #icon>
              <n-icon><TrashOutline /></n-icon>
            </template>
          </n-button>
        </n-flex>
      </n-flex>
    </n-flex>
  </n-card>
</template>

<script setup lang="ts">
import { ref, computed, type Component, watch } from 'vue'
import {
  NCard,
  NFlex,
  NButton,
  NSelect,
  NInput,
  NInputNumber,
  NDatePicker,
  NSwitch,
  NTag,
  NIcon,
} from 'naive-ui'
import { AddOutline, TrashOutline } from '@vicons/ionicons5'

const operatorDict = new Map([
  ['contains', '包含'],
  ['equals', '等于'],
  ['startsWith', '开头是'],
  ['endsWith', '结尾是'],
  ['greaterThan', '大于'],
  ['lessThan', '小于'],
  ['greaterThanOrEqual', '大于等于'],
  ['lessThanOrEqual', '小于等于'],
])

// 操作符常量
const operators = Array.from(operatorDict.entries()).map(([value, label]) => ({ value, label }))

type FilterValueType = string | number | boolean | null | undefined
type FilterFieldType = 'string' | 'number' | 'date' | 'boolean'
type OperatorType =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'

interface FilterOption {
  label: string
  value: string
  type: FilterFieldType
  operators?: string[]
}

interface FilterType {
  type: FilterFieldType
  operators: string[]
  component: Component
  props?: Record<string, any>
}

interface QuickFilter {
  label: string
  value: string
  filter: Filter
}

interface Filter {
  field: string
  operator: string
  value: FilterValueType
}

export type { OperatorType, FilterOption, QuickFilter, Filter }

const props = defineProps<{
  filterOptions: FilterOption[]
  quickFilters: QuickFilter[]
}>()

const emit = defineEmits(['update:filters', 'apply'])

const filters = ref<Filter[]>([])
const activeQuickFilters = computed(() =>
  filters.value.map(
    (f) =>
      props.quickFilters.find(
        (qf) =>
          qf.filter.field === f.field &&
          qf.filter.operator === f.operator &&
          qf.filter.value === f.value
      )?.value
  )
)

// 不可用的过滤字段
const unAvailableFilterFields = computed(() => {
  return filters.value.reduce((acc, filter) => {
    // 对于布尔值和字符串，只允许一个选择
    // 对于数字和日期，选择了 equals 或者构成范围就不再允许选择
    const option = props.filterOptions.find((opt) => opt.value === filter.field)
    if (!option) return acc

    const existingFilters = acc.has(filter.field)
      ? []
      : filters.value.filter((f) => f.field === filter.field)

    if (isFieldUnavailable(filter, option, existingFilters)) {
      acc.add(filter.field)
    }
    return acc
  }, new Set<string>())
})

// 小函数，提高可读性
const isFieldUnavailable = (filter: Filter, option: FilterOption, existingFilters: Filter[]) => {
  if (option.type === 'boolean' || option.type === 'string' || filter.operator === 'equals') {
    return true
  }
  if (option.type === 'number' || option.type === 'date') {
    const hasGreaterThan = existingFilters.some(
      (f) => f.operator === 'greaterThan' || f.operator === 'greaterThanOrEqual'
    )
    const hasLessThan = existingFilters.some(
      (f) => f.operator === 'lessThan' || f.operator === 'lessThanOrEqual'
    )
    return hasGreaterThan && hasLessThan
  }
  return false
}

const filterFieldOptions = computed(() => {
  return props.filterOptions.map((option) => ({
    label: option.label,
    value: option.value,
    disabled: unAvailableFilterFields.value.has(option.value),
  }))
})

const hasMoreFieldOptions = computed(
  () => unAvailableFilterFields.value.size < props.filterOptions.length
)

const hasFilters = computed(() => filters.value.length > 0)

const clearFilters = () => {
  filters.value = []
  emit('update:filters', [])
}

// 自动去重
watch(
  filters,
  (newFilters) => {
    const uniqueFilters = newFilters.reduce((acc, current) => {
      const x = acc.find(
        (item) =>
          item.field === current.field &&
          item.operator === current.operator &&
          item.value === current.value
      )
      if (!x) {
        return acc.concat([current])
      } else {
        return acc
      }
    }, [] as Filter[])

    if (uniqueFilters.length !== newFilters.length) {
      filters.value = uniqueFilters
      emit('update:filters', uniqueFilters)
    }
  },
  { deep: true }
)

const getOperatorOptions = (field: string) => {
  const option = props.filterOptions.find((opt) => opt.value === field)
  const operatorOptions =
    option?.operators ?? supportFieldTypes.get(option?.type ?? 'string')?.operators
  return (
    operatorOptions?.map((operator) => ({
      label: operatorDict.get(operator),
      value: operator,
    })) ?? operators
  )
}

const supportFieldTypes = new Map<string, FilterType>([
  [
    'string',
    {
      type: 'string',
      component: NInput,
      operators: ['contains', 'equals', 'startsWith', 'endsWith'],
    },
  ],
  [
    'number',
    {
      type: 'number',
      component: NInputNumber,
      operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
    },
  ],
  [
    'date',
    {
      type: 'date',
      component: NDatePicker,
      operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
      props: {
        type: 'datetime',
      },
    },
  ],
  ['boolean', { type: 'boolean', component: NSwitch, operators: ['equals'] }],
])

const getInputComponent = (field: string): { component: Component; props: Record<string, any> } => {
  const option = props.filterOptions.find((opt) => opt.value === field)
  const placeholder = `输入${option?.label || '值'}`

  const inputComponent = supportFieldTypes.get(option?.type ?? 'string')
  return {
    component: inputComponent?.component ?? NInput,
    props: {
      placeholder,
      ...inputComponent?.props,
    },
  }
}

const addFilter = () => {
  const availableFields = filterFieldOptions.value.filter((option) => !option.disabled)
  if (availableFields.length > 0) {
    const newFilter = { field: availableFields[0].value, operator: '', value: null }
    filters.value.push(newFilter)

    // Set default operator
    onFieldChange(filters.value.length - 1)
  }
}

const onFieldChange = (index: number) => {
  // 清除已设置的值和操作符
  filters.value[index].value = null
  // 为 filter operator 设置默认值
  filters.value[index].operator = getOperatorOptions(filters.value[index].field)[0].value
  emit('update:filters', filters.value)
}

const removeFilter = (index: number) => {
  filters.value.splice(index, 1)[0]
  emit('update:filters', filters.value)
}

const handleQuickFilterClick = (quickFilter: QuickFilter) => {
  if (!unAvailableFilterFields.value.has(quickFilter.filter.field)) {
    toggleQuickFilter(quickFilter.value)
  }
}

const toggleQuickFilter = (value: string) => {
  // 用值是否存在来判断是否已选中
  const isRemoved = activeQuickFilters.value.indexOf(value) > -1
  if (isRemoved) {
    // 已经选中时从 filters 中移除
    const quickFilter = props.quickFilters.find((qf) => qf.value === value)
    if (quickFilter) {
      const index = filters.value.findIndex(
        (f) =>
          f.field === quickFilter.filter.field &&
          f.operator === quickFilter.filter.operator &&
          f.value === quickFilter.filter.value
      )
      if (index !== -1) {
        filters.value.splice(index, 1)
        emit('update:filters', filters.value)
      }
    }
  } else {
    // 未选中时添加到 filters
    const quickFilter = props.quickFilters.find((qf) => qf.value === value)
    if (quickFilter) {
      filters.value.push(quickFilter.filter)
      emit('update:filters', filters.value)
    }
  }
}

type ComparisonOperator = 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual'

const applyFilters = () => {
  const validFilters = filters.value.filter(isValidFilter)

  // 更新 filters 并触发事件
  filters.value = validFilters
  emit('update:filters', validFilters)

  // 合并过滤器
  const mergedFilters = mergeFilters(validFilters)
  emit('apply', mergedFilters)
}

// 辅助函数：检查过滤器是否有效
const isValidFilter = (filter: Filter): boolean => {
  // 检查字段是否为空
  if (!filter.field) return false

  // 检查操作符是否为空
  if (!filter.operator) return false

  // 检查值是否有效
  if (filter.value === null || filter.value === undefined) return false

  // 对于布尔值，false 也是有效的
  if (typeof filter.value === 'boolean') return true

  // 对于数字，0 也是有效的
  if (typeof filter.value === 'number') return true

  // 对于字符串，检查是否为空字符串
  if (typeof filter.value === 'string' && filter.value.trim() === '') return false

  return true
}

const mergeFilters = (filters: Filter[]): Filter[] => {
  // 按 field 分组
  const groupedFilters = filters.reduce(
    (acc, filter) => {
      if (!acc[filter.field]) {
        acc[filter.field] = []
      }
      acc[filter.field].push(filter)
      return acc
    },
    {} as Record<string, Filter[]>
  )

  // 对每个组进行合并
  const mergedGroups = Object.entries(groupedFilters).map(([field, groupFilters]) => {
    const option = props.filterOptions.find((opt) => opt.value === field)
    if (!option) return groupFilters

    switch (option.type) {
      case 'string':
      case 'boolean':
        return [groupFilters[groupFilters.length - 1]]
      case 'number':
      case 'date':
        return mergeNumberOrDateFilters(groupFilters)
      default:
        return groupFilters
    }
  })

  // 合并结果整合为一个数组
  return mergedGroups.flat()
}

const mergeNumberOrDateFilters = (filters: Filter[]): Filter[] => {
  const equalsFilter = filters.find((f) => f.operator === 'equals')
  if (equalsFilter) return [equalsFilter]

  const comparisonFilters = filters.filter((f) =>
    ['greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'].includes(f.operator)
  ) as Filter[]

  const mergedGreaterThan = mergeComparisonFilters(comparisonFilters, [
    'greaterThan',
    'greaterThanOrEqual',
  ])
  const mergedLessThan = mergeComparisonFilters(comparisonFilters, ['lessThan', 'lessThanOrEqual'])

  return [...mergedGreaterThan, ...mergedLessThan]
}

const mergeComparisonFilters = (filters: Filter[], operators: ComparisonOperator[]): Filter[] => {
  const relevantFilters = filters.filter((f) =>
    operators.includes(f.operator as ComparisonOperator)
  )
  if (relevantFilters.length === 0) return []

  // 按实际操作符分组
  const groupedFilters = relevantFilters.reduce(
    (acc, filter) => {
      if (!acc[filter.operator as ComparisonOperator]) {
        acc[filter.operator as ComparisonOperator] = []
      }
      acc[filter.operator as ComparisonOperator].push(filter)
      return acc
    },
    {} as Record<ComparisonOperator, Filter[]>
  )

  // 对于每种操作符，选择最严格的过滤器
  const selectedFilters = operators
    .map((operator) => {
      const filtersForOperator = groupedFilters[operator] || []
      if (filtersForOperator.length === 0) return null

      // 根据操作符类型选择最严格的过滤器
      return filtersForOperator.reduce((strictest, current) => {
        const strictestValue = Number(strictest.value)
        const currentValue = Number(current.value)
        if (operator.startsWith('greater')) {
          return currentValue > strictestValue ? current : strictest
        } else {
          return currentValue < strictestValue ? current : strictest
        }
      })
    })
    .filter((filter): filter is Filter => filter !== null)

  // 如果有两个过滤器，需要进行额外的比较
  if (selectedFilters.length === 2) {
    const [filter1, filter2] = selectedFilters
    const value1 = Number(filter1.value)
    const value2 = Number(filter2.value)

    if (operators[0].startsWith('greater')) {
      if (value1 === value2) {
        // 当值相等时，选择更严格的操作符
        return [filter1.operator === 'greaterThan' ? filter1 : filter2]
      }
      return value1 > value2 ? [filter1] : [filter2]
    } else {
      if (value1 === value2) {
        // 当值相等时，选择更严格的操作符
        return [filter1.operator === 'lessThan' ? filter1 : filter2]
      }
      return value1 < value2 ? [filter1] : [filter2]
    }
  }

  return selectedFilters
}
</script>

<style scoped>
.filter-bar {
  border-radius: 8px;
  height: 100%;
  transition: all 0.3s ease;
}

.filter-bar:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.action-btn {
  transition: all 0.3s ease;
  margin-right: 8px;
}

.add-filter-btn,
.clear-filter-btn {
  border: 1px solid var(--n-primary-color);
  color: var(--n-primary-color);
}

.clear-filter-btn {
  background-color: var(--n-color-error-hover);
  border-color: var(--n-color-error);
  color: var(--n-color-error);
}

.clear-filter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-filter-tag {
  margin: 4px;
  transition: all 0.3s ease;
}

.quick-filter-tag:hover {
  transform: translateY(-2px);
  cursor: pointer;
}

.quick-filter-tag[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.quick-filter-tag[disabled]:hover {
  transform: none;
}

.filter-field {
  min-width: 120px;
  width: 100%;
  margin-right: 8px;
}

.filter-operator {
  min-width: 100px;
  width: 100%;
  margin-right: 8px;
}

.filter-input {
  min-width: 160px;
  width: 100%;
}

@media screen and (max-width: 768px) {
  .filter-item {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .filter-field,
  .filter-operator,
  .filter-input {
    margin-right: 0;
  }
}

.remove-filter-btn {
  padding: 4px;
  transition: all 0.3s ease;
}

.remove-filter-btn:hover {
  color: var(--n-color-error);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-item {
  animation: fadeIn 0.3s ease-out;
}
</style>
