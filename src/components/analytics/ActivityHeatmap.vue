<template>
  <CardSection class="overflow-hidden">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-serif font-medium text-foreground">活跃度热力图</h3>
      <span class="text-xs text-muted-foreground">过去 90 天</span>
    </div>
    
    <div v-if="!data || !data.days?.length" class="flex items-center justify-center h-32 text-muted-foreground text-sm">
      暂无活跃数据
    </div>
    
    <template v-else>
      <div class="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span><strong class="text-foreground">{{ activeDays }}</strong> 活跃天数</span>
        <span><strong class="text-foreground">{{ formatNumber(data.max_requests) }}</strong> 最高请求</span>
      </div>
      
      <div class="flex flex-col gap-1 w-full overflow-x-auto pb-2">
        <div class="flex gap-1 min-w-max">
          <div v-for="(week, wIndex) in calendar" :key="wIndex" class="flex flex-col gap-1">
            <div 
              v-for="(day, dIndex) in week" 
              :key="`${wIndex}-${dIndex}`"
              class="w-3 h-3 rounded-sm transition-colors duration-200"
              :class="getLevelClass(day?.level)"
              :title="day?.date ? `${day.date}: ${day.requests} 次请求` : ''"
            ></div>
          </div>
        </div>
        <div class="flex justify-end items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>少</span>
          <div class="flex gap-1">
            <div class="w-3 h-3 rounded-sm bg-secondary"></div>
            <div class="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40"></div>
            <div class="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60"></div>
            <div class="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/80"></div>
            <div class="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600"></div>
          </div>
          <span>多</span>
        </div>
      </div>
    </template>
  </CardSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardSection from '@/components/layout/CardSection.vue'
import type { ActivityHeatmap, ActivityHeatmapDay } from '@/api/usageRecords'

interface DayWithLevel extends ActivityHeatmapDay {
  level: number
}

const props = defineProps<{
  data: ActivityHeatmap | null
}>()

// 计算活跃天数
const activeDays = computed(() => {
  if (!props.data?.days) return 0
  return props.data.days.filter(d => d.requests > 0).length
})

// 将扁平数据转换为按周分组的日历数据
const calendar = computed(() => {
  if (!props.data?.days?.length) return []
  
  // 创建日期映射，并计算 level
  const maxRequests = props.data.max_requests || 1
  const map = new Map<string, DayWithLevel>()
  props.data.days.forEach(d => {
    const level = getIntensityLevel(d.requests, maxRequests)
    map.set(d.date, { ...d, level })
  })
  
  // 生成过去90天的日历
  const weeks: (DayWithLevel | null)[][] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 90)
  
  // 对齐到周日
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1)
  }
  
  let currentWeek: (DayWithLevel | null)[] = []
  const current = new Date(startDate)
  
  // 填充数据直到今天（或本周末）
  while (current <= today || current.getDay() !== 0) {
    if (current.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    
    const dateStr = current.toISOString().split('T')[0]
    currentWeek.push(map.get(dateStr) || { date: dateStr, requests: 0, total_tokens: 0, level: 0 })
    
    current.setDate(current.getDate() + 1)
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)
  
  return weeks
})

function getIntensityLevel(requests: number, maxRequests: number): number {
  if (requests === 0) return 0
  if (maxRequests === 0) return 0
  
  const ratio = requests / maxRequests
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function getLevelClass(level: number | undefined) {
  switch (level) {
    case 1: return 'bg-emerald-200 dark:bg-emerald-900/40'
    case 2: return 'bg-emerald-300 dark:bg-emerald-800/60'
    case 3: return 'bg-emerald-400 dark:bg-emerald-700/80'
    case 4: return 'bg-emerald-500 dark:bg-emerald-600'
    default: return 'bg-secondary'
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>
