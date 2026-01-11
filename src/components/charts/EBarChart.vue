<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import * as echarts from 'echarts/core'

echarts.use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

provide(THEME_KEY, 'light')

const props = defineProps<{
  data: any
  options?: any
  height?: number
}>()

const chartOption = computed(() => {
  if (!props.data || !props.data.labels || !props.data.datasets) return {}

  const labels = props.data.labels
  const dataset = props.data.datasets[0] || {}
  
  // Check if horizontal based on existing options logic (indexAxis: 'y')
  const isHorizontal = props.options?.indexAxis === 'y'

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item', // or 'axis'
      backgroundColor: 'rgb(31, 41, 55)',
      borderColor: 'rgb(75, 85, 99)',
      textStyle: {
        color: 'rgb(243, 244, 246)'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: isHorizontal ? {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgb(107, 114, 128)' },
      splitLine: {
        lineStyle: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    } : {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.3)' } },
      axisLabel: { color: 'rgb(107, 114, 128)' }
    },
    yAxis: isHorizontal ? {
      type: 'category',
      data: labels,
      inverse: true, // 反转 y 轴，让使用量多的在上面
      axisLine: { lineStyle: { color: 'rgba(156, 163, 175, 0.3)' } },
      axisLabel: { color: 'rgb(107, 114, 128)' }
    } : {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'rgb(107, 114, 128)' },
      splitLine: {
        lineStyle: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    },
    series: [
      {
        name: dataset.label || 'Value',
        type: 'bar',
        data: dataset.data,
        itemStyle: {
          color: 'rgba(59, 130, 246, 0.8)',
          borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
        },
        barMaxWidth: 30
      }
    ]
  }
})
</script>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
