<template>
  <CardSection class="h-[300px] flex flex-col">
    <div class="mb-4 flex items-center justify-between shrink-0">
      <h3 class="text-lg font-serif font-medium text-foreground">请求趋势</h3>
    </div>
    
    <div v-if="!data || !data.points?.length" class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      暂无请求数据
    </div>
    
    <template v-else>
      <div class="flex items-center gap-4 mb-3 text-xs text-muted-foreground shrink-0">
        <span><strong class="text-foreground">{{ formatNumber(totalRequests) }}</strong> 总请求</span>
        <span v-if="peakHour"><strong class="text-foreground">{{ peakHour }}</strong> 峰值时段</span>
      </div>
      
      <div class="flex-1 w-full min-h-0 relative">
        <EBarChart 
          :data="chartData" 
          :options="{
            indexAxis: 'x',
            barMaxWidth: 20
          }" 
        />
      </div>
    </template>
  </CardSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardSection from '@/components/layout/CardSection.vue'
import EBarChart from '@/components/charts/EBarChart.vue'
import type { RequestTimeline } from '@/api/usageRecords'

const props = defineProps<{
  data: RequestTimeline | null
}>()

const totalRequests = computed(() => {
  if (!props.data?.points) return 0
  return props.data.points.reduce((sum, p) => sum + p.requests, 0)
})

const peakHour = computed(() => {
  if (!props.data?.points?.length) return null
  const peak = props.data.points.reduce((max, p) => 
    p.requests > max.requests ? p : max, 
    { hour: '', requests: 0 }
  )
  if (peak.requests === 0) return null
  // Extract just the time part
  const timePart = peak.hour.split(' ')[1] || peak.hour
  return timePart
})

const chartData = computed(() => {
  if (!props.data?.points?.length) {
    return { labels: [], datasets: [] }
  }
  
  return {
    labels: props.data.points.map(p => {
      const timePart = p.hour.split(' ')[1] || p.hour
      return timePart
    }),
    datasets: [
      {
        label: '请求数',
        data: props.data.points.map(p => p.requests),
        color: '#3b82f6'
      }
    ]
  }
})

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>
