<template>
  <PageContainer>
    <PageHeader
      title="日志"
      description="查看服务器日志和请求历史"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Select v-model="logLevel">
            <SelectTrigger class="w-32">
              <SelectValue placeholder="日志级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="error">错误</SelectItem>
              <SelectItem value="warn">警告</SelectItem>
              <SelectItem value="info">信息</SelectItem>
              <SelectItem value="debug">调试</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" @click="clearLogs">
            <Trash2 class="w-4 h-4 mr-2" />
            清空
          </Button>
          <RefreshButton :loading="loading" @click="fetchLogs" />
        </div>
      </template>
    </PageHeader>

    <!-- Auto-refresh toggle -->
    <div class="flex items-center gap-4 mb-4">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="autoRefresh"
          class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span class="text-sm text-muted-foreground">自动刷新 (5秒)</span>
      </label>
      <span class="text-sm text-muted-foreground">
        {{ logs.length }} 条记录
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loading && logs.length === 0" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Empty State -->
    <CardSection v-else-if="logs.length === 0" class="text-center py-12">
      <ScrollText class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">暂无日志</h3>
      <p class="text-muted-foreground">服务器日志将显示在这里</p>
    </CardSection>

    <!-- Logs List -->
    <div v-else class="space-y-1">
      <div
        v-for="(log, index) in filteredLogs"
        :key="index"
        class="font-mono text-xs p-2 rounded border border-transparent hover:border-[#3d3929]/10 dark:hover:border-white/10 hover:bg-muted/30 transition-colors"
      >
        <div class="flex items-start gap-3">
          <span class="text-muted-foreground shrink-0">{{ formatTime(log.timestamp) }}</span>
          <Badge
            :variant="getLogLevelVariant(log.level)"
            class="shrink-0 uppercase text-[10px]"
          >
            {{ log.level }}
          </Badge>
          <span class="text-foreground break-all">{{ log.message }}</span>
        </div>
        <div v-if="log.details" class="mt-1 ml-[120px] text-muted-foreground">
          {{ log.details }}
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="mt-4 text-center">
      <Button variant="outline" @click="loadMore" :disabled="loadingMore">
        <Loader2 v-if="loadingMore" class="w-4 h-4 mr-2 animate-spin" />
        加载更多
      </Button>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Button from '@/components/ui/button.vue'
import Badge from '@/components/ui/badge.vue'
import RefreshButton from '@/components/ui/refresh-button.vue'
import Select from '@/components/ui/select.vue'
import SelectTrigger from '@/components/ui/select-trigger.vue'
import SelectValue from '@/components/ui/select-value.vue'
import SelectContent from '@/components/ui/select-content.vue'
import SelectItem from '@/components/ui/select-item.vue'
import {
  ScrollText,
  Trash2,
  Loader2,
} from 'lucide-vue-next'
import { formatTime as formatTimeUtil } from '@/utils/format'

interface LogResponse {
  lines: string[]
  'line-count': number
  'latest-timestamp': number
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  details?: string
}

const { toast } = useToast()

const loading = ref(true)
const loadingMore = ref(false)
const logs = ref<LogEntry[]>([])
const logLevel = ref('all')
const autoRefresh = ref(false)
const hasMore = ref(false)
const latestTimestamp = ref(0)
const limit = 100

let refreshInterval: number | null = null

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') return logs.value
  return logs.value.filter(log => log.level.toLowerCase() === logLevel.value)
})

function formatTime(timestamp: string): string {
  return formatTimeUtil(timestamp) || timestamp
}

function getLogLevelVariant(level: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (level.toLowerCase()) {
    case 'error': return 'destructive'
    case 'warn': return 'outline'
    case 'info': return 'default'
    default: return 'secondary'
  }
}

function parseLogLine(line: string): LogEntry {
  // Parse log line format: "[2024-01-01 12:00:00] [LEVEL] message"
  const match = line.match(/^\[?(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]?\s*\[?(\w+)\]?\s*(.*)$/)
  if (match) {
    return {
      timestamp: match[1],
      level: match[2].toLowerCase(),
      message: match[3]
    }
  }
  // Fallback for unstructured lines
  return {
    timestamp: '',
    level: 'info',
    message: line
  }
}

async function fetchLogs() {
  loading.value = true
  latestTimestamp.value = 0
  try {
    const data = await apiClient.get<LogResponse>('/logs', {
      params: { limit }
    })
    const lines = data?.lines || []
    logs.value = lines.map(parseLogLine)
    latestTimestamp.value = data?.['latest-timestamp'] || 0
    // If we got limit lines, there might be more
    hasMore.value = lines.length >= limit
  } catch {
    // Logs endpoint might not exist, use empty array
    logs.value = []
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    const data = await apiClient.get<LogResponse>('/logs', {
      params: { limit, after: latestTimestamp.value }
    })
    const lines = data?.lines || []
    const newLogs = lines.map(parseLogLine)
    logs.value.push(...newLogs)
    latestTimestamp.value = data?.['latest-timestamp'] || latestTimestamp.value
    hasMore.value = lines.length >= limit
  } catch {
    toast({ title: '加载更多日志失败', variant: 'destructive' })
  } finally {
    loadingMore.value = false
  }
}

async function clearLogs() {
  try {
    await apiClient.delete('/logs')
    logs.value = []
    toast({ title: '日志已清空' })
  } catch {
    toast({ title: '清空日志失败', variant: 'destructive' })
  }
}

watch(autoRefresh, (enabled) => {
  if (enabled) {
    refreshInterval = window.setInterval(fetchLogs, 5000)
  } else if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

onMounted(fetchLogs)

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
