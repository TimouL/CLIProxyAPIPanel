<template>
  <div class="request-timeline">
    <!-- Loading State -->
    <div v-if="loading" class="py-4">
      <div class="animate-pulse">
        <div class="h-32 bg-muted/50 rounded-lg"></div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4"
    >
      <p class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
    </div>

    <!-- Timeline Content -->
    <div
      v-else-if="candidates && candidates.length > 0"
      class="bg-muted/30 rounded-lg border border-border/50 overflow-hidden"
    >
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <h4 class="text-sm font-semibold">请求链路追踪</h4>
            <div 
              class="px-2 py-1 rounded text-xs font-medium"
              :class="getFinalStatusClass()"
            >
              {{ getFinalStatusLabel() }}
            </div>
          </div>
          <div class="text-sm text-muted-foreground">
            {{ formatLatency(totalLatency) }}
          </div>
        </div>

        <!-- Timeline Track -->
        <div class="timeline-track">
          <div
            v-for="(candidate, index) in candidates"
            :key="candidate.id"
            class="timeline-node"
            :class="{
              selected: selectedIndex === index,
              hovered: hoveredIndex === index && selectedIndex !== index
            }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
            @click="selectedIndex = index"
          >
            <!-- Node container -->
            <div class="node-container">
              <!-- Node label (above node) -->
              <div class="node-label">
                {{ candidate.provider }}
              </div>

              <!-- Main node -->
              <div
                class="node-dot"
                :class="getStatusColorClass(candidate.status)"
              />

              <!-- Connection line -->
              <div
                v-if="index < candidates.length - 1"
                class="node-line"
              />
            </div>
          </div>
        </div>

        <!-- Selected Details Panel -->
        <div
          v-if="selectedCandidate"
          class="detail-panel mt-6"
        >
          <div class="panel-header">
            <div class="panel-title">
              <span
                class="title-dot"
                :class="getStatusColorClass(selectedCandidate.status)"
              />
              <span class="title-text">{{ selectedCandidate.provider }}</span>
              <span
                class="status-tag"
                :class="getStatusColorClass(selectedCandidate.status)"
              >
                {{ selectedCandidate.status_code || getStatusLabel(selectedCandidate.status) }}
              </span>
            </div>
            <div class="panel-nav">
              <button
                class="nav-btn"
                :disabled="selectedIndex === 0"
                @click="navigateCandidate(-1)"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <span class="nav-info">{{ selectedIndex + 1 }} / {{ candidates.length }}</span>
              <button
                class="nav-btn"
                :disabled="selectedIndex === candidates.length - 1"
                @click="navigateCandidate(1)"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="panel-body">
            <!-- Core information grid -->
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">API密钥</span>
                <span class="info-value">
                  <code class="key-preview">{{ selectedCandidate.api_key_masked }}</code>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">耗时</span>
                <span class="info-value highlight">
                  {{ formatLatency(selectedCandidate.duration_ms) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">候选索引</span>
                <span class="info-value">{{ selectedCandidate.candidate_index }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">重试索引</span>
                <span class="info-value">{{ selectedCandidate.retry_index }}</span>
              </div>
            </div>

            <!-- Error information -->
            <div
              v-if="selectedCandidate.status === 'failed' && selectedCandidate.error_message"
              class="error-block"
            >
              <div class="error-type">错误信息</div>
              <div class="error-msg">{{ selectedCandidate.error_message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-muted/30 rounded-lg border border-border/50 border-dashed p-8 text-center"
    >
      <p class="text-sm text-muted-foreground">暂无追踪数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { usageRecordsApi, type RequestCandidate } from '../../api/usageRecords'

const props = defineProps<{
  requestId: number
  overrideStatusCode?: number
}>()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const candidates = ref<RequestCandidate[]>([])
const selectedIndex = ref(0)
const hoveredIndex = ref<number | null>(null)

// Computed
const selectedCandidate = computed(() => {
  return candidates.value[selectedIndex.value] || null
})

const totalLatency = computed(() => {
  if (!candidates.value.length) return 0
  
  // Use the successful candidate's duration, or the last candidate's duration
  const successCandidate = candidates.value.find(c => c.success)
  if (successCandidate) {
    return successCandidate.duration_ms
  }
  
  return candidates.value[candidates.value.length - 1]?.duration_ms || 0
})

// Methods
const formatLatency = (ms: number | undefined | null): string => {
  if (ms === undefined || ms === null) return '-'
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${ms}ms`
}

const getFinalStatusClass = (): string => {
  // Use override status code if provided
  if (props.overrideStatusCode !== undefined) {
    return props.overrideStatusCode === 200 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
  }
  
  // Check if any candidate succeeded
  const hasSuccess = candidates.value.some(c => c.success)
  return hasSuccess
    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
}

const getFinalStatusLabel = (): string => {
  // Use override status code if provided
  if (props.overrideStatusCode !== undefined) {
    return props.overrideStatusCode === 200 ? '最终成功' : '最终失败'
  }
  
  // Check if any candidate succeeded
  const hasSuccess = candidates.value.some(c => c.success)
  return hasSuccess ? '最终成功' : '最终失败'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '等待中',
    success: '成功',
    failed: '失败',
    skipped: '跳过'
  }
  return labels[status] || status
}

const getStatusColorClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    success: 'status-success',
    failed: 'status-failed',
    skipped: 'status-skipped'
  }
  return classes[status] || 'status-pending'
}

const navigateCandidate = (direction: number) => {
  const newIndex = selectedIndex.value + direction
  if (newIndex >= 0 && newIndex < candidates.value.length) {
    selectedIndex.value = newIndex
  }
}

const loadCandidates = async () => {
  if (!props.requestId) return

  loading.value = true
  error.value = null

  try {
    const result = await usageRecordsApi.getRequestCandidates(props.requestId)
    candidates.value = result.candidates || []
    
    // Auto-select the most meaningful candidate
    if (candidates.value.length > 0) {
      // Find successful candidate first
      const successIndex = candidates.value.findIndex(c => c.success)
      if (successIndex >= 0) {
        selectedIndex.value = successIndex
      } else {
        // Find failed candidate
        const failedIndex = candidates.value.findIndex(c => c.status === 'failed')
        selectedIndex.value = failedIndex >= 0 ? failedIndex : candidates.value.length - 1
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || '加载失败'
    console.error('Failed to load request candidates:', err)
  } finally {
    loading.value = false
  }
}

// Watch for requestId changes
watch(() => props.requestId, () => {
  selectedIndex.value = 0
  loadCandidates()
}, { immediate: true })

onMounted(() => {
  loadCandidates()
})
</script>

<script lang="ts">
export default {
  name: 'RequestTimeline'
}
</script>

<style scoped>
.request-timeline {
  width: 100%;
}

/* Timeline track */
.timeline-track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 2rem 0;
}

.timeline-node {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

/* Node container */
.node-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Node label - positioned above node */
.node-label {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main node - concentric circles */
.node-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 2;
  position: relative;
  cursor: pointer;
  /* Outer ring */
  border: 2px solid currentColor;
  background: transparent;
}

/* Inner solid circle - using ::before pseudo-element */
.node-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  transform: translate(-50%, -50%);
}

/* Selected state: breathing animation + ripple effect */
.timeline-node.selected .node-dot {
  animation: breathe 2s ease-in-out infinite;
}

.timeline-node.selected .node-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  background: transparent;
  transform: translate(-50%, -50%);
  animation: ripple 1.5s ease-out infinite;
  z-index: -1;
}

/* Hover state: scale effect only */
.timeline-node.hovered .node-dot {
  transform: scale(1.3);
}

@keyframes breathe {
  0%, 100% { transform: scale(1.3); }
  50% { transform: scale(1.5); }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* Status colors - using color for concentric circles */
.node-dot.status-success { color: #22c55e; }
.node-dot.status-failed { color: #ef4444; }
.node-dot.status-pending { color: #3b82f6; }
.node-dot.status-skipped { color: #1f2937; }

.node-line {
  width: 64px;
  height: 2px;
  background: hsl(var(--border));
  margin: 0 -1px;
  z-index: 1;
}

/* Details panel */
.detail-panel {
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border));
  border-radius: 14px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.4);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.title-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.title-dot.status-success { background: #22c55e; }
.title-dot.status-failed { background: #ef4444; }
.title-dot.status-pending { background: #3b82f6; }
.title-dot.status-skipped { background: #1f2937; }

.title-text {
  font-weight: 600;
  font-size: 0.95rem;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  margin-left: 0.5rem;
}

.status-tag.status-success {
  background: #22c55e20;
  color: #16a34a;
}

.status-tag.status-failed {
  background: #ef444420;
  color: #dc2626;
}

.status-tag.status-pending {
  background: #3b82f620;
  color: #2563eb;
}

.status-tag.status-skipped {
  background: #1f293720;
  color: #1f2937;
}

.panel-nav {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  border-radius: 6px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-btn:hover:not(:disabled) {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border-color: hsl(var(--muted-foreground) / 0.3);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-info {
  font-size: 0.8rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  padding: 0 0.5rem;
  min-width: 50px;
  text-align: center;
}

.panel-body {
  padding: 0.75rem 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.7rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-value.highlight {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  color: hsl(var(--primary));
}

.key-preview {
  font-size: 0.8rem;
  padding: 0.1rem 0.3rem;
  background: hsl(var(--muted));
  border-radius: 3px;
  color: hsl(var(--muted-foreground));
  font-family: ui-monospace, monospace;
}

/* Error information */
.error-block {
  margin-top: 1rem;
  padding: 0.875rem;
  background: #ef444410;
  border: 1px solid #ef444430;
  border-radius: 8px;
}

.error-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.error-msg {
  font-size: 0.85rem;
  color: #dc2626;
  word-break: break-word;
}
</style>