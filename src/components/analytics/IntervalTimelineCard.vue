<template>
  <Card class="p-4 overflow-hidden">
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm font-semibold">
        {{ title }}
      </p>
      <div
        v-if="displayLegendItems.length > 0"
        class="flex items-center gap-2 flex-wrap justify-end text-[11px]"
      >
        <div
          v-for="item in displayLegendItems"
          :key="item.id"
          class="flex items-center gap-1"
        >
          <div
            class="w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          <span class="text-muted-foreground">{{ item.name }}</span>
        </div>
        <span
          v-if="hiddenLegendCount > 0"
          class="text-muted-foreground"
        >
          +{{ hiddenLegendCount }} 更多
        </span>
      </div>
    </div>
    <div
      v-if="loading"
      class="h-[160px] flex items-center justify-center"
    >
      <div class="text-sm text-muted-foreground">
        加载中...
      </div>
    </div>
    <div
      v-else-if="hasData"
      class="h-[160px]"
    >
      <ScatterChart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <div
      v-else
      class="h-[160px] flex items-center justify-center text-sm text-muted-foreground"
    >
      暂无请求间隔数据
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import Card from '@/components/ui/card.vue'
import ScatterChart from '@/components/charts/ScatterChart.vue'
import { usageRecordsApi, type IntervalTimelineResult } from '@/api/usageRecords'
import type { ChartData, ChartOptions } from 'chart.js'

const props = withDefaults(defineProps<{
  title?: string
  hours?: number
}>(), {
  title: '请求间隔时间线',
  hours: 24
})

const loading = ref(false)
const timelineData = ref<IntervalTimelineResult | null>(null)
const primaryColor = ref('201, 100, 66')

// 预定义的颜色列表
const COLORS = [
  'rgba(59, 130, 246, 0.7)',   // blue
  'rgba(236, 72, 153, 0.7)',   // pink
  'rgba(34, 197, 94, 0.7)',    // green
  'rgba(249, 115, 22, 0.7)',   // orange
  'rgba(168, 85, 247, 0.7)',   // purple
  'rgba(234, 179, 8, 0.7)',    // yellow
  'rgba(14, 165, 233, 0.7)',   // sky
  'rgba(239, 68, 68, 0.7)',    // red
  'rgba(20, 184, 166, 0.7)',   // teal
  'rgba(99, 102, 241, 0.7)',   // indigo
]

function getPrimaryColor(): string {
  if (typeof window === 'undefined') return '201, 100, 66'
  const body = document.body
  const style = getComputedStyle(body)
  const rgb = style.getPropertyValue('--color-primary-rgb').trim()
  return rgb || '201, 100, 66'
}

onMounted(() => {
  primaryColor.value = getPrimaryColor()
  loadData()
})

const hasData = computed(() =>
  timelineData.value && timelineData.value.points && timelineData.value.points.length > 0
)

const hasMultipleModels = computed(() => {
  return timelineData.value?.models && timelineData.value.models.length > 1
})

const MAX_LEGEND_ITEMS = 6

const legendItems = computed(() => {
  if (timelineData.value?.models && timelineData.value.models.length > 1) {
    return timelineData.value.models.map((model, index) => ({
      id: model,
      name: formatModelName(model),
      color: COLORS[index % COLORS.length]
    }))
  }
  return []
})

const displayLegendItems = computed(() => {
  return legendItems.value.slice(0, MAX_LEGEND_ITEMS)
})

const hiddenLegendCount = computed(() => {
  return Math.max(0, legendItems.value.length - MAX_LEGEND_ITEMS)
})

function formatModelName(model: string): string {
  if (model.includes('claude')) {
    const match = model.match(/claude-(\d+)-(\d+)?-?(\w+)?/i)
    if (match) {
      const major = match[1]
      const minor = match[2]
      const variant = match[3]
      let name = `Claude ${major}`
      if (minor) name += `.${minor}`
      if (variant) name += ` ${variant.charAt(0).toUpperCase() + variant.slice(1)}`
      return name
    }
  }
  return model.length > 20 ? `${model.slice(0, 17)}...` : model
}

const chartData = computed<ChartData<'scatter'>>(() => {
  if (!timelineData.value?.points) {
    return { datasets: [] }
  }

  const points = timelineData.value.points

  // 如果有多个模型，按模型分组
  if (timelineData.value.models && timelineData.value.models.length > 1) {
    const models = timelineData.value.models
    const modelColorMap: Record<string, string> = {}
    models.forEach((model, index) => {
      modelColorMap[model] = COLORS[index % COLORS.length]
    })

    const groupedData: Record<string, Array<{ x: string; y: number }>> = {}
    for (const point of points) {
      const model = point.model || 'unknown'
      if (!groupedData[model]) {
        groupedData[model] = []
      }
      groupedData[model].push({ x: point.x, y: point.y })
    }

    const datasets = Object.entries(groupedData).map(([model, data]) => ({
      label: formatModelName(model),
      data,
      backgroundColor: modelColorMap[model] || 'rgba(59, 130, 246, 0.6)',
      borderColor: modelColorMap[model] || 'rgba(59, 130, 246, 0.8)',
      pointRadius: 3,
      pointHoverRadius: 5,
    }))

    return { datasets }
  }

  // 单模型：使用主题色
  return {
    datasets: [{
      label: '请求间隔',
      data: points.map(p => ({ x: p.x, y: p.y })),
      backgroundColor: `rgba(${primaryColor.value}, 0.6)`,
      borderColor: `rgba(${primaryColor.value}, 0.8)`,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  }
})

const chartOptions = computed<ChartOptions<'scatter'>>(() => ({
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const point = context.raw as { x: string; y: number; _originalY?: number }
          const realY = point._originalY ?? point.y
          const datasetLabel = context.dataset.label || ''
          if (hasMultipleModels.value) {
            return `${datasetLabel}: ${realY.toFixed(1)} 分钟`
          }
          return `间隔: ${realY.toFixed(1)} 分钟`
        }
      }
    }
  }
}))

async function loadData() {
  loading.value = true
  try {
    timelineData.value = await usageRecordsApi.getIntervalTimeline(props.hours, 5000)
  } catch (error) {
    console.error('加载请求间隔时间线失败:', error)
    timelineData.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.hours, () => {
  loadData()
})
</script>
