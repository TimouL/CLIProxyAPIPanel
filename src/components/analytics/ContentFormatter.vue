<template>
  <div>
    <div
      v-if="!data || (typeof data === 'object' && Object.keys(data).length === 0)"
      class="text-sm text-muted-foreground"
    >
      {{ emptyMessage }}
    </div>
    
    <!-- Format selector for string content -->
    <div v-else-if="typeof data === 'string' && detectedFormats.length > 1" class="mb-3">
      <div class="flex items-center gap-2 text-xs">
        <span class="text-muted-foreground">格式:</span>
        <button
          v-for="format in detectedFormats"
          :key="format.type"
          @click="selectedFormat = format.type"
          class="px-2 py-1 rounded text-xs transition-colors"
          :class="selectedFormat === format.type 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground hover:bg-muted/80'"
        >
          {{ format.label }}
        </button>
      </div>
    </div>

    <!-- Formatted content display -->
    <div class="bg-muted/30 overflow-hidden rounded-lg border border-border/50">
      <!-- JSON format (OpenAI, Claude, Gemini API) -->
      <JsonViewer
        v-if="currentFormat === 'json'"
        :data="parsedData"
        :expand-depth="expandDepth"
        :is-dark="isDark"
      />
      
      <!-- HTTP headers format -->
      <HeadersViewer
        v-else-if="currentFormat === 'headers'"
        :data="parsedHeaders"
        :is-dark="isDark"
      />
      
      <!-- URL encoded format -->
      <UrlEncodedViewer
        v-else-if="currentFormat === 'urlencoded'"
        :data="parsedUrlEncoded"
        :is-dark="isDark"
      />
      
      <!-- Server-Sent Events (SSE) format for streaming -->
      <SseViewer
        v-else-if="currentFormat === 'sse'"
        :data="data"
        :is-dark="isDark"
      />
      
      <!-- Raw text fallback -->
      <div v-else class="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
        <pre class="text-xs font-mono whitespace-pre-wrap">{{ data }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { JsonViewer, HeadersViewer, UrlEncodedViewer, SseViewer } from '../analytics'

interface FormatOption {
  type: string
  label: string
  confidence: number
}

const props = defineProps<{
  data: any
  expandDepth: number
  isDark: boolean
  emptyMessage: string
}>()

const selectedFormat = ref<string>('auto')

// 检测内容格式 - 专门针对大模型API
const detectedFormats = computed((): FormatOption[] => {
  if (typeof props.data !== 'string') {
    return [{ type: 'json', label: 'JSON', confidence: 1.0 }]
  }

  const content = props.data.trim()
  const formats: FormatOption[] = []

  // JSON 检测 (OpenAI, Claude, Gemini API 标准格式)
  if (isValidJson(content)) {
    formats.push({ type: 'json', label: 'JSON', confidence: 0.9 })
  }

  // Server-Sent Events 检测 (流式响应)
  if (isSseFormat(content)) {
    formats.push({ type: 'sse', label: 'SSE Stream', confidence: 0.85 })
  }

  // HTTP Headers 检测
  if (isHttpHeaders(content)) {
    formats.push({ type: 'headers', label: 'HTTP Headers', confidence: 0.8 })
  }

  // URL Encoded 检测 (表单数据)
  if (isUrlEncoded(content)) {
    formats.push({ type: 'urlencoded', label: 'URL Encoded', confidence: 0.7 })
  }

  // 如果没有检测到特定格式，添加纯文本选项
  if (formats.length === 0) {
    formats.push({ type: 'text', label: 'Plain Text', confidence: 0.1 })
  }

  // 按置信度排序
  return formats.sort((a, b) => b.confidence - a.confidence)
})

// 当前使用的格式
const currentFormat = computed(() => {
  if (selectedFormat.value === 'auto') {
    return detectedFormats.value[0]?.type || 'text'
  }
  return selectedFormat.value
})

// 解析后的数据
const parsedData = computed(() => {
  if (typeof props.data !== 'string') {
    return props.data
  }

  if (currentFormat.value === 'json') {
    try {
      return JSON.parse(props.data)
    } catch {
      return props.data
    }
  }

  return props.data
})

// 解析HTTP头
const parsedHeaders = computed(() => {
  if (typeof props.data !== 'string' || currentFormat.value !== 'headers') {
    return {}
  }

  const headers: Record<string, string> = {}
  const lines = props.data.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      headers[key.trim()] = valueParts.join(':').trim()
    }
  }
  
  return headers
})

// 解析URL编码数据
const parsedUrlEncoded = computed(() => {
  if (typeof props.data !== 'string' || currentFormat.value !== 'urlencoded') {
    return {}
  }

  const params: Record<string, string> = {}
  const pairs = props.data.split('&')
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
  }
  
  return params
})

// 格式检测函数
function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

function isSseFormat(str: string): boolean {
  // 检测 Server-Sent Events 格式 (data: {...})
  return /^data:\s*\{.*\}$/m.test(str) || str.includes('data: [DONE]')
}

function isHttpHeaders(str: string): boolean {
  const lines = str.split('\n')
  let headerCount = 0
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && trimmed.includes(':')) {
      const [key] = trimmed.split(':')
      // 检查是否像HTTP头的格式
      if (/^[a-zA-Z-]+$/.test(key.trim())) {
        headerCount++
      }
    }
  }
  
  return headerCount >= 2 // 至少2个有效的头部行
}

function isUrlEncoded(str: string): boolean {
  // 检查是否包含URL编码的特征
  return /^[^=&]*=[^=&]*(&[^=&]*=[^=&]*)*$/.test(str.trim())
}

// 监听数据变化，重置格式选择
watch(() => props.data, () => {
  selectedFormat.value = 'auto'
})
</script>

<script lang="ts">
export default {
  name: 'ContentFormatter'
}
</script>

<style scoped>
/* 样式继承自JsonContent组件 */
</style>