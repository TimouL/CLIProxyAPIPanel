<template>
  <div
    class="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
    :class="[
      themeClasses.bg,
      themeClasses.border
    ]"
  >
    <!-- Header -->
    <div>
      <div class="flex items-start gap-3">
        <!-- Type Badge -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm"
          :style="{ backgroundColor: typeColor.bg, color: typeColor.text }"
        >
          <component :is="getIconForType(file.type)" class="h-5 w-5" />
        </div>
        
        <!-- File Info - Two Rows -->
        <div class="min-w-0 flex-1">
          <!-- First Row: File Name -->
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold text-foreground truncate" :title="file.name">
              {{ file.name }}
            </h3>
            <span v-if="file.disabled" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shrink-0">
              已禁用
            </span>
          </div>
          
          <!-- Second Row: Size, Date and Action Buttons -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{{ formatFileSize(file.size) }}</span>
              <span class="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
              <span>{{ formatDate(file.modified) }}</span>
            </div>
            
            <!-- Actions Buttons -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button v-if="showQuota" variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 transition-all duration-200" aria-label="支持模型" title="支持模型" @click="$emit('show-models')">
                <Bot class="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-110 transition-all duration-200" aria-label="凭证信息" title="凭证信息" @click="$emit('show-info')">
                <Info class="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:scale-110 transition-all duration-200" aria-label="下载" @click="$emit('download', file.name)">
                <Download class="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-all duration-200" aria-label="删除" @click="$emit('delete', file.name)">
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar (Request History Simulation) -->
    <!-- Ideally this would come from props, but for now just visual placeholder or stats if available -->
    <div v-if="hasStats" class="mb-4 space-y-2">
       <div class="flex items-center justify-between text-xs">
         <span class="text-muted-foreground">最近活动</span>
         <span class="font-medium" :class="successRateColor">{{ successRate }}% 成功率</span>
       </div>
       <div class="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted/30">
         <div v-for="(stat, i) in recentStats" :key="i" 
              class="h-full flex-1 rounded-sm"
              :class="{
                'bg-green-500': stat === 'success',
                'bg-red-500': stat === 'error',
                'bg-yellow-500': stat === 'warning',
                'bg-gray-200 dark:bg-gray-700': stat === 'idle'
              }"
         ></div>
       </div>
    </div>

    <!-- Quota Section -->
    <div v-if="showQuota" class="mt-auto pt-4 border-t border-border/50">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-muted-foreground">配额使用情况</span>
        <Button 
          variant="ghost" 
          size="sm" 
          class="h-6 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all duration-200 p-0"
          :disabled="loading"
          aria-label="刷新配额"
          @click="loadQuota"
        >
          <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': loading }" />
          {{ loading ? '加载中...' : '刷新' }}
        </Button>
      </div>

      <!-- Error State -->
      <div v-if="quotaState?.status === 'error'" class="rounded bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-600 dark:text-red-400">
        {{ quotaState.error || '配额加载失败' }}
      </div>

      <!-- Antigravity Quota -->
      <div v-else-if="file.type === 'antigravity' && quotaState?.status === 'success'" class="space-y-3">
        <div v-for="group in quotaState.groups" :key="group.id">
           <div class="flex justify-between text-xs mb-1">
             <span class="text-foreground/80">{{ group.label }}</span>
             <div class="flex items-center gap-2">
               <span class="font-mono">{{ (group.remainingFraction * 100).toFixed(0) }}%</span>
               <span v-if="group.resetTime" class="text-[10px] text-muted-foreground">{{ formatQuotaResetTime(group.resetTime) }}</span>
             </div>
           </div>
           <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
             <div 
               class="h-full transition-all duration-500 rounded-full"
               :class="getProgressColor(group.remainingFraction)"
               :style="{ width: `${group.remainingFraction * 100}%` }"
             ></div>
           </div>
        </div>
        <div v-if="quotaState.groups.length === 0" class="text-xs text-muted-foreground text-center py-2">
          暂无配额信息
        </div>
      </div>

      <!-- Codex Quota -->
      <div v-else-if="file.type === 'codex' && quotaState?.status === 'success'" class="space-y-3">
        <div v-for="win in quotaState.windows" :key="win.id">
           <div class="flex justify-between text-xs mb-1">
             <span class="text-foreground/80">{{ win.label }}</span>
             <div class="flex items-center gap-2">
               <span class="font-mono">{{ win.usedPercent !== null ? (100 - win.usedPercent).toFixed(1) + '%' : 'N/A' }}</span>
               <span v-if="win.resetLabel" class="text-[10px] text-muted-foreground">{{ win.resetLabel }}</span>
             </div>
           </div>
           <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
             <!-- Show remaining quota (100 - used), green = full -->
             <div 
               class="h-full transition-all duration-500 rounded-full"
               :class="getProgressColor((100 - (win.usedPercent || 0)) / 100)"
               :style="{ width: `${Math.max(100 - (win.usedPercent || 0), 0)}%` }"
             ></div>
           </div>
        </div>
      </div>

      <!-- Gemini CLI Quota -->
      <div v-else-if="file.type === 'gemini-cli' && quotaState?.status === 'success'" class="space-y-3">
         <div v-for="bucket in quotaState.buckets" :key="bucket.id">
           <div class="flex justify-between text-xs mb-1">
             <span class="text-foreground/80">{{ bucket.label }}</span>
             <div class="flex items-center gap-2">
               <span class="font-mono">{{ bucket.remainingFraction !== null ? (bucket.remainingFraction * 100).toFixed(0) + '%' : 'N/A' }}</span>
               <span v-if="bucket.resetTime" class="text-[10px] text-muted-foreground">{{ formatQuotaResetTime(bucket.resetTime) }}</span>
             </div>
           </div>
           <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
             <div 
               v-if="bucket.remainingFraction !== null"
               class="h-full transition-all duration-500 rounded-full"
               :class="getProgressColor(bucket.remainingFraction)"
               :style="{ width: `${bucket.remainingFraction * 100}%` }"
             ></div>
           </div>
        </div>
      </div>

      <!-- Default / Idle State -->
      <div v-else-if="!loading && quotaState?.status === 'idle'" class="text-xs text-muted-foreground text-center py-2">
        点击刷新加载配额
      </div>
    </div>
    
    <!-- No Quota support -->
    <div v-else class="mt-auto pt-4 border-t border-border/50 text-xs text-muted-foreground text-center py-1">
      此类型不支持配额查询
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, inject, watch, type Ref } from 'vue'
import { 
  FileJson, 
  Download, 
  Trash2, 
  RefreshCw, 
  Code, 
  Cpu, 
  Box, 
  Zap,
  Bot,
  Info
} from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'
import type { AuthFileItem, AntigravityQuotaState, CodexQuotaState, GeminiCliQuotaState } from '@/types'
import { TYPE_COLORS, formatQuotaResetTime } from '@/utils/quota'
import { useQuota } from '@/composables/useQuota'
import { formatUnixTimestamp, formatDateOnly } from '@/utils/format'

const props = defineProps<{
  file: AuthFileItem
}>()

defineEmits<{
  (e: 'download', name: string): void
  (e: 'delete', name: string): void
  (e: 'show-models'): void
  (e: 'show-info'): void
}>()

const { quotaState, loading, loadQuota, resetQuota } = useQuota(props.file)

// Subscribe to batch refresh trigger from parent
const refreshTrigger = inject<Ref<Set<string>>>('quotaRefreshTrigger', undefined)

if (refreshTrigger) {
  watch(refreshTrigger, (newTrigger) => {
    if (newTrigger && newTrigger.size > 0 && newTrigger.has(props.file.name)) {
      loadQuota()
    }
  })
}

// Helper: Format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return '未知大小'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Helper: Format date (handles Unix timestamp in milliseconds or seconds, or ISO string)
const formatDate = (dateValue?: number | string) => {
  if (!dateValue) return ''
  if (typeof dateValue === 'number') {
    return formatUnixTimestamp(dateValue) || ''
  }
  return formatDateOnly(dateValue) || ''
}

// Theme colors
const typeColor = computed(() => {
  const type = (props.file.type || 'default').toLowerCase()
  const colorSet = TYPE_COLORS[type] || TYPE_COLORS['default']
  // We'll return light/dark depending on system preference later, 
  // but for now let's use CSS variables or a computed based on document class?
  // Tailwind handles dark mode via class, so we can't easily switch JS objects dynamically without a store.
  // Instead, let's use the 'light' values for light mode and handle dark via CSS classes if possible, 
  // OR just assume a specific look.
  // Better: Return the object and use inline styles carefully or map to Tailwind classes if possible.
  // Since we have custom hex codes, let's use inline styles for the badge background/text.
  
  // For dark mode compatibility, we might need to check "dark" class on html.
  // But Vue component doesn't inherently know this without a store.
  // Let's rely on a simpler approach: Use the "light" definitions by default, 
  // but maybe modify them to be CSS variables or just use them as-is.
  // The provided TYPE_COLORS has 'light' and 'dark'.
  // Let's pick one based on a simple check or just default to light for the 'style' binding,
  // and hope it looks okay or use CSS classes.
  
  // ACTUALLY: Let's use Tailwind classes for the card background (bg-card) 
  // and use the custom colors ONLY for the badge.
  // We can return the color set.
  return colorSet.light // Default to light for badge colors which are usually pastels. 
                        // If we want dark mode specific badge colors, we'd need a theme store.
})

// Dynamic classes for card border/bg tint based on type
const themeClasses = computed(() => {
  // We can add a very subtle tint to the card based on type
  // But let's keep it clean: just bg-card and standard border.
  return {
    bg: '',
    border: ''
  }
})

// Icons
const getIconForType = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'antigravity': return Zap
    case 'codex': return Code
    case 'gemini': return Bot
    case 'gemini-cli': return Bot
    case 'claude': return Cpu
    case 'qwen': return Box
    default: return FileJson
  }
}

// Stats (Mocked for now as AuthFileItem doesn't strictly have this yet)
const hasStats = computed(() => {
  return false // Enable when backend supports stats on file list
})
const successRate = 98
const successRateColor = 'text-green-500'
const recentStats = ['success', 'success', 'success', 'success', 'warning', 'success', 'error', 'success', 'success', 'success']

// Quota visibility
const showQuota = computed(() => {
  return ['antigravity', 'codex', 'gemini-cli'].includes(props.file.type || '')
})

// Progress bar colors
const getProgressColor = (fraction: number) => {
  if (fraction > 0.6) return 'bg-green-500'
  if (fraction > 0.2) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getUsageColor = (percent: number) => {
  if (percent < 60) return 'bg-green-500'
  if (percent < 90) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>
