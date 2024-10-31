export interface DataItem {
  name: string
  value: number
}

export interface MetricsTab {
  key: string
  label: string
}

export interface MetricsData {
  tabs: MetricsTab[]
  data: DataItem[]
}
