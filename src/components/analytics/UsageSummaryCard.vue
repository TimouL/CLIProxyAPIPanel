<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <CardSection>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <Activity class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div class="text-sm font-medium text-muted-foreground">总请求数</div>
          <div class="text-2xl font-bold font-mono tracking-tight">{{ formatNumber(data.total_requests) }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">成功率 {{ (data.success_rate * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </CardSection>

    <CardSection>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <Zap class="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div class="text-sm font-medium text-muted-foreground">平均耗时</div>
          <div class="text-2xl font-bold font-mono tracking-tight">{{ formatDuration(data.avg_duration_ms) }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">{{ data.unique_models }} 个模型</div>
        </div>
      </div>
    </CardSection>

    <CardSection>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <Cpu class="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div class="text-sm font-medium text-muted-foreground">总 Tokens</div>
          <div class="text-2xl font-bold font-mono tracking-tight">{{ formatNumber(data.total_tokens) }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">
            输入: {{ formatNumber(data.input_tokens) }} / 输出: {{ formatNumber(data.output_tokens) }}
          </div>
        </div>
      </div>
    </CardSection>

    <CardSection>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
          <Server class="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <div class="text-sm font-medium text-muted-foreground">提供商</div>
          <div class="text-2xl font-bold font-mono tracking-tight">{{ data.unique_providers }}</div>
          <div class="text-xs text-muted-foreground mt-0.5">{{ data.failure_requests }} 次失败</div>
        </div>
      </div>
    </CardSection>
  </div>
</template>

<script setup lang="ts">
import { Activity, Zap, Cpu, Server } from 'lucide-vue-next'
import CardSection from '@/components/layout/CardSection.vue'
import type { UsageSummary } from '@/api/usageRecords'

defineProps<{
  data: UsageSummary
}>()

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
  return num.toString()
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}
</script>
