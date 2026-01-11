<template>
  <div class="w-full h-full relative">
    <canvas ref="chartRef" />
    <div
      v-if="crosshairStats"
      class="absolute top-2 right-2 bg-gray-800/90 text-gray-100 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-600"
    >
      <div class="font-medium text-yellow-400">
        Y = {{ crosshairStats.yValue.toFixed(1) }} 分钟
      </div>
      <div
        v-if="crosshairStats.datasets.length === 1"
        class="mt-1"
      >
        <span class="text-green-400">{{ crosshairStats.datasets[0].belowCount }}</span> / {{ crosshairStats.datasets[0].totalCount }} 点在横线以下
        <span class="ml-2 text-blue-400">({{ crosshairStats.datasets[0].belowPercent.toFixed(1) }}%)</span>
      </div>
      <div
        v-else
        class="mt-1 space-y-0.5"
      >
        <div
          v-for="ds in crosshairStats.datasets"
          :key="ds.label"
          class="flex items-center gap-2"
        >
          <div
            class="w-2 h-2 rounded-full flex-shrink-0"
            :style="{ backgroundColor: ds.color }"
          />
          <span class="text-gray-300 truncate max-w-[80px]">{{ ds.label }}:</span>
          <span class="text-green-400">{{ ds.belowCount }}</span>/<span class="text-gray-400">{{ ds.totalCount }}</span>
          <span class="text-blue-400">({{ ds.belowPercent.toFixed(0) }}%)</span>
        </div>
        <div class="flex items-center gap-2 pt-1 border-t border-gray-600 mt-1">
          <span class="text-gray-300">总计:</span>
          <span class="text-green-400">{{ crosshairStats.totalBelowCount }}</span>/<span class="text-gray-400">{{ crosshairStats.totalCount }}</span>
          <span class="text-blue-400">({{ crosshairStats.totalBelowPercent.toFixed(1) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  ScatterController,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type Scale
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  LinearScale,
  PointElement,
  ScatterController,
  TimeScale,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: ChartData<'scatter'>
  options?: ChartOptions<'scatter'>
  height?: number
}

interface DatasetStats {
  label: string
  color: string
  belowCount: number
  totalCount: number
  belowPercent: number
}

interface CrosshairStats {
  yValue: number
  datasets: DatasetStats[]
  totalBelowCount: number
  totalCount: number
  totalBelowPercent: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  options: undefined,
})

const chartRef = ref<HTMLCanvasElement>()
let chart: ChartJS<'scatter'> | null = null

const crosshairY = ref<number | null>(null)

const crosshairStats = computed<CrosshairStats | null>(() => {
  if (crosshairY.value === null || !props.data.datasets) return null

  const datasetStats: DatasetStats[] = []
  let totalBelowCount = 0
  let totalCount = 0

  for (const dataset of props.data.datasets) {
    if (!dataset.data) continue

    let belowCount = 0
    let dsTotal = 0

    for (const point of dataset.data) {
      const p = point as unknown as { x: string; y: number }
      if (typeof p.y === 'number') {
        dsTotal++
        totalCount++
        if (p.y <= crosshairY.value) {
          belowCount++
          totalBelowCount++
        }
      }
    }

    if (dsTotal > 0) {
      datasetStats.push({
        label: dataset.label || 'Unknown',
        color: (dataset.backgroundColor as string) || 'rgba(59, 130, 246, 0.7)',
        belowCount,
        totalCount: dsTotal,
        belowPercent: (belowCount / dsTotal) * 100
      })
    }
  }

  if (totalCount === 0) return null

  return {
    yValue: crosshairY.value,
    datasets: datasetStats,
    totalBelowCount,
    totalCount,
    totalBelowPercent: (totalBelowCount / totalCount) * 100
  }
})

// Non-linear Y axis transformation
const BREAKPOINT = 10
const LOWER_RATIO = 0.7

function toDisplayValue(realValue: number): number {
  if (realValue <= BREAKPOINT) {
    return realValue * (LOWER_RATIO * 100 / BREAKPOINT)
  } else {
    const upperRange = 120 - BREAKPOINT
    const displayUpperRange = (1 - LOWER_RATIO) * 100
    return LOWER_RATIO * 100 + ((realValue - BREAKPOINT) / upperRange) * displayUpperRange
  }
}

function toRealValue(displayValue: number): number {
  const breakpointDisplay = LOWER_RATIO * 100
  if (displayValue <= breakpointDisplay) {
    return displayValue / (LOWER_RATIO * 100 / BREAKPOINT)
  } else {
    const upperRange = 120 - BREAKPOINT
    const displayUpperRange = (1 - LOWER_RATIO) * 100
    return BREAKPOINT + ((displayValue - breakpointDisplay) / displayUpperRange) * upperRange
  }
}

function transformData(data: ChartData<'scatter'>): ChartData<'scatter'> {
  return {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      data: (dataset.data as unknown as Array<{ x: string; y: number }>).map(point => ({
        ...point,
        y: toDisplayValue(point.y),
        _originalY: point.y
      }))
    })) as ChartData<'scatter'>['datasets']
  }
}

const defaultOptions: ChartOptions<'scatter'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    x: {
      type: 'time',
      time: {
        displayFormats: {
          hour: 'HH:mm',
          minute: 'HH:mm'
        },
        tooltipFormat: 'HH:mm',
        unit: 'hour'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10
      }
    },
    y: {
      type: 'linear',
      min: 0,
      max: 100,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        callback(this: Scale, tickValue: string | number) {
          const displayVal = Number(tickValue)
          const targetTicks = [0, 2, 5, 10, 30, 60, 120]
          for (const target of targetTicks) {
            const targetDisplay = toDisplayValue(target)
            if (Math.abs(displayVal - targetDisplay) < 1) {
              return `${target}`
            }
          }
          return ''
        },
        stepSize: 5,
        autoSkip: false
      },
      title: {
        display: true,
        text: '间隔 (分钟)',
        color: 'rgb(107, 114, 128)'
      },
      afterBuildTicks(scale: Scale) {
        const targetTicks = [0, 2, 5, 10, 30, 60, 120]
        scale.ticks = targetTicks.map(val => ({
          value: toDisplayValue(val),
          label: `${val}`
        }))
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgb(31, 41, 55)',
      titleColor: 'rgb(243, 244, 246)',
      bodyColor: 'rgb(243, 244, 246)',
      borderColor: 'rgb(75, 85, 99)',
      borderWidth: 1,
      callbacks: {
        title: (contexts) => {
          if (contexts.length === 0) return ''
          const point = contexts[0].raw as { x: string }
          const date = new Date(point.x)
          return date.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        },
        label: (context) => {
          const point = context.raw as { x: string; y: number; _originalY?: number }
          const realY = point._originalY ?? toRealValue(point.y)
          return `间隔: ${realY.toFixed(1)} 分钟`
        }
      }
    }
  },
  onHover: (event, _elements, chartInstance) => {
    const canvas = chartInstance.canvas
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseY = (event.native as MouseEvent)?.clientY

    if (mouseY === undefined) {
      crosshairY.value = null
      return
    }

    const { chartArea, scales } = chartInstance
    const yScale = scales.y

    if (!chartArea || !yScale) return

    const relativeY = mouseY - rect.top

    if (relativeY < chartArea.top || relativeY > chartArea.bottom) {
      crosshairY.value = null
    } else {
      const displayValue = yScale.getValueForPixel(relativeY)
      crosshairY.value = displayValue !== undefined ? toRealValue(displayValue) : null
    }

    chartInstance.draw()
  }
}

const crosshairPlugin: Plugin<'scatter'> = {
  id: 'crosshairLine',
  afterDraw: (chartInstance) => {
    if (crosshairY.value === null) return

    const { ctx, chartArea, scales } = chartInstance
    const yScale = scales.y
    if (!yScale || !chartArea) return

    const displayValue = toDisplayValue(crosshairY.value)
    const yPixel = yScale.getPixelForValue(displayValue)

    if (yPixel < chartArea.top || yPixel > chartArea.bottom) return

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(chartArea.left, yPixel)
    ctx.lineTo(chartArea.right, yPixel)
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.restore()
  }
}

function handleMouseLeave() {
  crosshairY.value = null
  if (chart) {
    chart.draw()
  }
}

function createChart() {
  if (!chartRef.value) return

  const transformedData = transformData(props.data)

  chart = new ChartJS(chartRef.value, {
    type: 'scatter',
    data: transformedData,
    options: {
      ...defaultOptions,
      ...props.options
    },
    plugins: [crosshairPlugin]
  })

  chartRef.value.addEventListener('mouseleave', handleMouseLeave)
}

function updateChart() {
  if (chart) {
    chart.data = transformData(props.data)
    chart.update('none')
  }
}

onMounted(async () => {
  await nextTick()
  createChart()
})

onUnmounted(() => {
  if (chartRef.value) {
    chartRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
  if (chart) {
    chart.destroy()
    chart = null
  }
})

watch(() => props.data, updateChart, { deep: true })
watch(() => props.options, () => {
  if (chart) {
    chart.options = {
      ...defaultOptions,
      ...props.options
    }
    chart.update()
  }
}, { deep: true })
</script>
