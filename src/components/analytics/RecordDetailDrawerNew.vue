<template>
  <Drawer 
    :open="!!record" 
    title="请求详情"
    :description="`ID: ${record?.request_id || ''}`"
    size="xl"
    @update:open="$emit('close')"
  >
    <div v-if="record" class="space-y-6">
      <!-- Status Banner -->
      <div 
        class="p-4 rounded-lg border flex items-center gap-3"
        :class="record.status_code >= 200 && record.status_code < 300 
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'"
      >
        <div 
          class="w-2 h-2 rounded-full"
          :class="record.status_code >= 200 && record.status_code < 300 ? 'bg-green-500' : 'bg-red-500'"
        />
        <div class="flex-1">
          <div class="font-medium" :class="record.status_code >= 200 && record.status_code < 300 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
            {{ record.status_code }} {{ record.status_code >= 200 && record.status_code < 300 ? '成功' : '失败' }}
          </div>
          <div class="text-xs opacity-80 mt-0.5">
            {{ formatTimestamp(record.timestamp) }}
          </div>
        </div>
        <div class="text-right">
          <div class="font-mono font-bold">{{ record.duration_ms }}ms</div>
          <div class="text-xs opacity-80">耗时</div>
        </div>
      </div>

      <!-- Meta Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">模型</div>
          <div class="font-medium font-mono text-sm bg-muted/50 p-2 rounded border border-border/50 break-all">
            {{ record.model }}
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">提供商</div>
          <div class="font-medium font-mono text-sm bg-muted/50 p-2 rounded border border-border/50 capitalize">
            {{ record.provider }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="space-y-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">Tokens</div>
          <div class="font-mono text-sm p-1">{{ record.total_tokens }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">输入/输出</div>
          <div class="font-mono text-sm p-1">{{ record.input_tokens }} / {{ record.output_tokens }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">IP</div>
          <div class="font-mono text-sm p-1">{{ record.ip || '-' }}</div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="!record.success" class="space-y-2">
        <div class="text-xs text-muted-foreground uppercase tracking-wider">请求失败</div>
        <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 font-mono break-all">
          HTTP {{ record.status_code }}
        </div>
      </div>

      <!-- Request/Response Body (Optional - if available) -->
      <div v-if="details?.request_body" class="space-y-2">
        <div class="text-xs text-muted-foreground uppercase tracking-wider">请求体</div>
        <div class="bg-muted/50 rounded-lg border border-border/50 max-h-60 overflow-y-auto">
          <ContentFormatter
            :data="details.request_body"
            :expand-depth="2"
            :is-dark="false"
            empty-message="无请求体数据"
          />
        </div>
      </div>

      <div v-if="details?.response_body" class="space-y-2">
        <div class="text-xs text-muted-foreground uppercase tracking-wider">响应体</div>
        <div class="bg-muted/50 rounded-lg border border-border/50 max-h-60 overflow-y-auto">
          <ContentFormatter
            :data="details.response_body"
            :expand-depth="2"
            :is-dark="false"
            empty-message="无响应体数据"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Drawer } from '@/components/ui'
import { ContentFormatter } from '@/components/analytics'
import { Loader2 } from 'lucide-vue-next'
import { usageRecordsApi, type UsageRecord } from '@/api/usageRecords'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  record: UsageRecord | null
}>()

const emit = defineEmits(['close'])

const details = ref<{ request_body?: string; response_body?: string } | null>(null)
const loading = ref(false)
const requestToken = ref(0)

watch(() => props.record, async (newVal) => {
  // Clear old data immediately
  details.value = null
  
  if (newVal) {
    loading.value = true
    // Use token to handle race condition
    const currentToken = ++requestToken.value
    try {
      // Fetch full details including bodies if not already present
      // In a real app, listing might not return bodies, so we fetch by ID
      const fullData = await usageRecordsApi.getById(newVal.id)
      // Only apply if this is still the latest request
      if (currentToken === requestToken.value) {
        details.value = {
          request_body: fullData.request_body,
          response_body: fullData.response_body
        }
      }
    } catch (e) {
      console.error('Failed to load record details', e)
    } finally {
      if (currentToken === requestToken.value) {
        loading.value = false
      }
    }
  }
})

function formatTimestamp(timestamp: string): string {
  return formatDateTime(timestamp) || '未知时间'
}
</script>