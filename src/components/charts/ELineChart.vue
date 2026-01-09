<template>
  <div class="w-full h-full">
    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { use, graphic } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
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
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// Use dark theme if needed, or rely on echarts default.
// Ideally pass theme prop or detect system preference.
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

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgb(31, 41, 55)',
      borderColor: 'rgb(75, 85, 99)',
      textStyle: {
        color: 'rgb(243, 244, 246)'
      },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>${item.marker}${item.seriesName}: ${item.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLine: {
        lineStyle: {
          color: 'rgba(156, 163, 175, 0.3)'
        }
      },
      axisLabel: {
        color: 'rgb(107, 114, 128)'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: 'rgb(107, 114, 128)'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    },
    series: [
      {
        name: dataset.label || 'Value',
        type: 'line',
        smooth: true, // Make it curvy and beautiful
        symbol: 'none', // Cleaner look, show symbol on hover only?
        // symbolSize: 6,
        data: dataset.data,
        itemStyle: {
          color: 'rgb(59, 130, 246)'
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.05)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        }
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
