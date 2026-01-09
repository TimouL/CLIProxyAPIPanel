<template>
  <PageContainer>
    <PageHeader
      title="用量统计"
      description="查看 API 使用指标和趋势"
    >
      <template #actions>
        <RefreshButton :loading="loading" @click="fetchUsage" />
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardSection>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div class="text-2xl font-bold text-foreground">{{ formatNumber(usage.totalRequests) }}</div>
              <div class="text-sm text-muted-foreground">总请求数</div>
            </div>
          </div>
        </CardSection>

        <CardSection>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowUp class="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div class="text-2xl font-bold text-foreground">{{ formatNumber(usage.inputTokens) }}</div>
              <div class="text-sm text-muted-foreground">输入 Token</div>
            </div>
          </div>
        </CardSection>

        <CardSection>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ArrowDown class="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div class="text-2xl font-bold text-foreground">{{ formatNumber(usage.outputTokens) }}</div>
              <div class="text-sm text-muted-foreground">输出 Token</div>
            </div>
          </div>
        </CardSection>

        <CardSection>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <DollarSign class="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div class="text-2xl font-bold text-foreground">${{ usage.estimatedCost?.toFixed(4) || '0.00' }}</div>
              <div class="text-sm text-muted-foreground">预估费用</div>
            </div>
          </div>
        </CardSection>
      </div>

      <!-- Usage by Provider -->
      <Section title="按提供商统计" class="mb-8">
        <div v-if="Object.keys(usage.byProvider || {}).length === 0" class="text-center py-8 text-muted-foreground">
          暂无使用数据
        </div>
        <div v-else class="space-y-3">
          <CardSection
            v-for="(stats, provider) in usage.byProvider"
            :key="provider"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot class="w-5 h-5 text-primary" />
              </div>
              <div>
                <div class="font-medium text-foreground capitalize">{{ provider }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ formatNumber(stats.requests) }} 次请求
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-mono text-sm text-foreground">
                {{ formatNumber(stats.inputTokens + stats.outputTokens) }} tokens
              </div>
              <div class="text-xs text-muted-foreground">
                输入: {{ formatNumber(stats.inputTokens) }} | 输出: {{ formatNumber(stats.outputTokens) }}
              </div>
            </div>
          </CardSection>
        </div>
      </Section>

      <!-- Recent Activity -->
      <Section title="最近活动">
        <div v-if="recentActivity.length === 0" class="text-center py-8 text-muted-foreground">
          暂无最近活动
        </div>
        <div v-else class="space-y-2">
          <CardSection
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-2 h-2 rounded-full shrink-0"
                :class="activity.success ? 'bg-green-500' : 'bg-red-500'"
              />
              <div class="min-w-0 flex-1">
                <div class="text-sm text-foreground truncate">
                  {{ activity.model || activity.endpoint || 'Unknown' }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ formatDate(activity.timestamp) }}
                </div>
              </div>
            </div>
            <div class="text-right text-sm">
              <div class="font-mono text-foreground">{{ formatNumber(activity.tokens || 0) }}</div>
              <div class="text-xs text-muted-foreground">tokens</div>
            </div>
          </CardSection>
        </div>
      </Section>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Section from '@/components/layout/Section.vue'
import RefreshButton from '@/components/ui/refresh-button.vue'
import {
  Activity,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Bot,
  Loader2,
} from 'lucide-vue-next'

interface UsageResponse {
  usage: UsageStats
  failed_requests: number
}

interface UsageStats {
  totalRequests?: number
  total_requests?: number
  inputTokens?: number
  input_tokens?: number
  outputTokens?: number
  output_tokens?: number
  estimatedCost?: number
  byProvider?: Record<string, {
    requests: number
    inputTokens: number
    outputTokens: number
  }>
  by_provider?: Record<string, {
    requests: number
    input_tokens: number
    output_tokens: number
  }>
}

interface ActivityItem {
  model?: string
  endpoint?: string
  timestamp: string
  tokens?: number
  success: boolean
}

const { toast } = useToast()

const loading = ref(true)
const usage = ref<{
  totalRequests: number
  inputTokens: number
  outputTokens: number
  estimatedCost?: number
  byProvider?: Record<string, {
    requests: number
    inputTokens: number
    outputTokens: number
  }>
}>({
  totalRequests: 0,
  inputTokens: 0,
  outputTokens: 0,
})
const recentActivity = ref<ActivityItem[]>([])

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

async function fetchUsage() {
  loading.value = true
  try {
    const [usageData, activityData] = await Promise.allSettled([
      apiClient.get<UsageResponse>('/usage'),
      apiClient.get<ActivityItem[]>('/usage/recent'),
    ])

    if (usageData.status === 'fulfilled' && usageData.value) {
      const raw = usageData.value.usage || usageData.value
      // Normalize snake_case to camelCase
      usage.value = {
        totalRequests: raw.totalRequests ?? raw.total_requests ?? 0,
        inputTokens: raw.inputTokens ?? raw.input_tokens ?? 0,
        outputTokens: raw.outputTokens ?? raw.output_tokens ?? 0,
        estimatedCost: raw.estimatedCost,
        byProvider: raw.byProvider || raw.by_provider,
      }
    }

    if (activityData.status === 'fulfilled') {
      recentActivity.value = Array.isArray(activityData.value) ? activityData.value : []
    }
  } catch {
    toast({ title: '加载使用数据失败', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsage)
</script>
