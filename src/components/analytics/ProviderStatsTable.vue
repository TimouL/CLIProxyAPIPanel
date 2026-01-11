<template>
  <CardSection class="flex flex-col h-full">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-serif font-medium text-foreground">提供商统计</h3>
    </div>
    
    <div class="overflow-x-auto -mx-6 px-6 pb-2">
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-muted-foreground uppercase border-b border-border/50">
          <tr>
            <th class="py-3 pr-4 font-medium">提供商</th>
            <th class="py-3 px-2 text-right font-medium">请求数</th>
            <th class="py-3 px-2 text-right font-medium">Tokens</th>
            <th class="py-3 px-2 text-right font-medium">成功率</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/30">
          <tr v-for="item in data" :key="item.provider" class="group hover:bg-muted/30">
            <td class="py-3 pr-4 font-medium text-foreground capitalize group-hover:text-primary transition-colors">
              {{ item.provider }}
            </td>
            <td class="py-3 px-2 text-right font-mono text-muted-foreground">
              {{ formatNumber(item.request_count) }}
            </td>
            <td class="py-3 px-2 text-right font-mono text-muted-foreground">
              {{ formatNumber(item.total_tokens) }}
            </td>
            <td class="py-3 px-2 text-right font-mono">
              <span :class="item.request_count > 0 && (item.success_count / item.request_count) >= 0.99 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                {{ item.request_count > 0 ? ((item.success_count / item.request_count) * 100).toFixed(1) : '0.0' }}%
              </span>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td colspan="4" class="py-8 text-center text-muted-foreground">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </CardSection>
</template>

<script setup lang="ts">
import CardSection from '@/components/layout/CardSection.vue'
import type { ProviderStats } from '@/api/usageRecords'

defineProps<{
  data: ProviderStats[]
}>()

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>
