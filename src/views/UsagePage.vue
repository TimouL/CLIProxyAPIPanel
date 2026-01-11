<template>
  <PageContainer>
    <PageHeader
      title="使用记录"
      description="追踪 API 调用详情和性能指标"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Select v-model="selectedPeriod">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今天</SelectItem>
              <SelectItem value="yesterday">昨天</SelectItem>
              <SelectItem value="last7days">最近7天</SelectItem>
              <SelectItem value="last30days">最近30天</SelectItem>
              <SelectItem value="last90days">最近90天</SelectItem>
            </SelectContent>
          </Select>
          <RefreshButton :loading="loading" @click="refresh" />
        </div>
      </template>
    </PageHeader>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && !hasData" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- 顶部概览卡片 -->
      <div class="mb-6">
        <UsageSummaryCard :data="summary" />
      </div>

      <!-- 活跃度热力图 + 请求趋势 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ActivityHeatmap :data="heatmap" />
        <RequestTimeline :data="timeline" />
      </div>

      <!-- 统计表格区 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ModelStatsTable :data="modelStats" />
        <ProviderStatsTable :data="providerStats" />
      </div>

      <!-- 详细记录列表 -->
      <Section title="调用日志" description="最近的 API 请求记录详情">
        <template #actions>
          <div class="flex gap-2">
            <Select v-model="filterModel" @update:model-value="handleFilterChange">
              <SelectTrigger class="w-[150px]">
                <SelectValue placeholder="所有模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有模型</SelectItem>
                <SelectItem v-for="m in options.models" :key="m" :value="m">{{ m }}</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filterProvider" @update:model-value="handleFilterChange">
              <SelectTrigger class="w-[120px]">
                <SelectValue placeholder="所有提供商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有提供商</SelectItem>
                <SelectItem v-for="p in options.providers" :key="p" :value="p">{{ p }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </template>

        <CardSection class="overflow-hidden">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[180px]">时间</TableHead>
                  <TableHead>模型 / 提供商</TableHead>
                  <TableHead class="text-right">令牌数</TableHead>
                  <TableHead class="text-right">耗时</TableHead>
                  <TableHead class="text-center w-[100px]">状态</TableHead>
                  <TableHead class="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  v-for="record in records" 
                  :key="record.id" 
                  class="cursor-pointer hover:bg-muted/50"
                  @click="selectedRecord = record"
                >
                  <TableCell class="font-mono text-xs text-muted-foreground">
                    {{ formatTime(record.timestamp) }}
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col">
                      <span class="font-medium text-foreground">{{ record.model }}</span>
                      <span class="text-xs text-muted-foreground capitalize">{{ record.provider }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right font-mono">
                    {{ record.total_tokens }}
                  </TableCell>
                  <TableCell class="text-right font-mono text-xs">
                    {{ record.duration_ms }}ms
                  </TableCell>
                  <TableCell class="text-center">
                    <Badge 
                      :variant="record.success ? 'success' : 'destructive'"
                      class="font-mono text-xs"
                    >
                      {{ record.status_code }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRight class="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
                
                <TableRow v-if="records.length === 0">
                  <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
                    没有找到相关记录
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div class="py-4 border-t border-border flex justify-end px-4">
            <Pagination 
              :total="totalRecords" 
              :page-size="pageSize" 
              :current="currentPage"
              @update:current="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </CardSection>
      </Section>
    </template>

    <RecordDetailDrawer 
      :record="selectedRecord" 
      @close="selectedRecord = null" 
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronRight, Loader2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import Section from '@/components/layout/Section.vue'
import CardSection from '@/components/layout/CardSection.vue'
import RefreshButton from '@/components/ui/refresh-button.vue'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Pagination from '@/components/ui/pagination.vue'

import {
  UsageSummaryCard,
  ActivityHeatmap,
  RequestTimeline,
  ModelStatsTable,
  ProviderStatsTable,
  RecordDetailDrawer
} from '@/components/analytics'

import { 
  usageRecordsApi, 
  type UsageRecord, 
  type UsageSummary, 
  type ActivityHeatmap as ActivityHeatmapType,
  type RequestTimeline as RequestTimelineType,
  type ModelStats,
  type ProviderStats,
  type UsageRecordOptionsResult
} from '@/api/usageRecords'

import type { PeriodValue } from '@/features/usage/types'
import { getDateRangeFromPeriod } from '@/features/usage/composables'
import { formatShortDateTime } from '@/utils/format'

const { toast } = useToast()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const selectedPeriod = ref<PeriodValue>('last7days')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)

// Filters
const filterModel = ref('all')
const filterProvider = ref('all')
const options = ref<UsageRecordOptionsResult>({ models: [], providers: [] })

// Data
const summary = ref<UsageSummary>({
  total_requests: 0,
  success_requests: 0,
  failure_requests: 0,
  success_rate: 0,
  total_tokens: 0,
  input_tokens: 0,
  output_tokens: 0,
  avg_duration_ms: 0,
  unique_models: 0,
  unique_providers: 0
})
const heatmap = ref<ActivityHeatmapType | null>(null)
const timeline = ref<RequestTimelineType | null>(null)
const modelStats = ref<ModelStats[]>([])
const providerStats = ref<ProviderStats[]>([])
const records = ref<UsageRecord[]>([])
const selectedRecord = ref<UsageRecord | null>(null)

const hasData = computed(() => {
  return summary.value.total_requests > 0 || records.value.length > 0
})

// Helper functions
function formatTime(timestamp: string): string {
  return formatShortDateTime(timestamp) || timestamp
}

function getTimeRange(): { startTime: string; endTime: string } {
  const range = getDateRangeFromPeriod(selectedPeriod.value)
  return { 
    startTime: range.start_time || '', 
    endTime: range.end_time || '' 
  }
}

// Actions
async function fetchAllData() {
  loading.value = true
  error.value = null
  
  try {
    const { startTime, endTime } = getTimeRange()
    
    // Parallel fetch for dashboard widgets
    const [
      summaryData, 
      heatmapData, 
      timelineData, 
      modelData, 
      providerData,
      optionsData
    ] = await Promise.all([
      usageRecordsApi.getSummary(startTime, endTime),
      usageRecordsApi.getHeatmap(90),
      usageRecordsApi.getTimeline(startTime, endTime),
      usageRecordsApi.getModelStats(startTime, endTime),
      usageRecordsApi.getProviderStats(startTime, endTime),
      usageRecordsApi.getOptions(startTime, endTime)
    ])

    summary.value = summaryData
    heatmap.value = heatmapData
    timeline.value = timelineData
    modelStats.value = modelData.models || []
    providerStats.value = providerData.providers || []
    options.value = optionsData

    // Fetch table data separately
    await fetchRecords()
    
  } catch (err) {
    console.error(err)
    error.value = '加载数据失败，请检查网络连接或稍后重试'
    toast({ title: '加载失败', variant: 'destructive', description: '无法获取最新使用记录' })
  } finally {
    loading.value = false
  }
}

async function fetchRecords() {
  const { startTime, endTime } = getTimeRange()
  
  try {
    const res = await usageRecordsApi.list({
      page: currentPage.value,
      page_size: pageSize.value,
      start_time: startTime,
      end_time: endTime,
      model: filterModel.value === 'all' ? undefined : filterModel.value,
      provider: filterProvider.value === 'all' ? undefined : filterProvider.value
    })
    
    records.value = res.records || []
    totalRecords.value = res.total || 0
  } catch (err) {
    console.error('Failed to fetch records list', err)
  }
}

function handleFilterChange() {
  currentPage.value = 1
  fetchRecords()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchRecords()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchRecords()
}

async function refresh() {
  await fetchAllData()
}

// Watchers
watch(selectedPeriod, () => {
  currentPage.value = 1
  fetchAllData()
})

// Init
onMounted(fetchAllData)
</script>
