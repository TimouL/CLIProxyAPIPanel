<template>
  <div
    class="sse-viewer"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="sse-events">
      <div
        v-for="(event, index) in parsedEvents"
        :key="index"
        class="sse-event"
        :class="{ 'is-done': event.isDone }"
      >
        <div class="event-header">
          <span class="event-type">{{ event.type }}</span>
          <span v-if="event.id" class="event-id">ID: {{ event.id }}</span>
          <span class="event-index">#{{ index + 1 }}</span>
        </div>
        
        <div v-if="event.isDone" class="event-done">
          <span class="done-marker">[DONE]</span>
        </div>
        
        <div v-else-if="event.data" class="event-data">
          <JsonViewer
            :data="event.data"
            :expand-depth="2"
            :is-dark="isDark"
          />
        </div>
        
        <div v-else class="event-raw">
          <pre>{{ event.raw }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { JsonViewer } from '../analytics'

interface SseEvent {
  type: string
  id?: string
  data?: any
  raw: string
  isDone: boolean
}

const props = defineProps<{
  data: string
  isDark: boolean
}>()

const parsedEvents = computed((): SseEvent[] => {
  const events: SseEvent[] = []
  const lines = props.data.split('\n')
  
  let currentEvent: Partial<SseEvent> = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      // 空行表示事件结束
      if (Object.keys(currentEvent).length > 0) {
        events.push({
          type: currentEvent.type || 'data',
          id: currentEvent.id,
          data: currentEvent.data,
          raw: currentEvent.raw || '',
          isDone: currentEvent.isDone || false
        })
        currentEvent = {}
      }
      continue
    }
    
    if (trimmed.startsWith('data:')) {
      const dataContent = trimmed.substring(5).trim()
      currentEvent.raw = trimmed
      
      if (dataContent === '[DONE]') {
        currentEvent.isDone = true
        currentEvent.type = 'done'
      } else {
        try {
          currentEvent.data = JSON.parse(dataContent)
          currentEvent.type = 'data'
        } catch {
          currentEvent.data = dataContent
          currentEvent.type = 'text'
        }
      }
    } else if (trimmed.startsWith('event:')) {
      currentEvent.type = trimmed.substring(6).trim()
    } else if (trimmed.startsWith('id:')) {
      currentEvent.id = trimmed.substring(3).trim()
    } else if (trimmed.startsWith('retry:')) {
      // 忽略 retry 字段
    } else {
      // 其他内容作为原始数据
      currentEvent.raw = (currentEvent.raw || '') + '\n' + trimmed
    }
  }
  
  // 处理最后一个事件
  if (Object.keys(currentEvent).length > 0) {
    events.push({
      type: currentEvent.type || 'data',
      id: currentEvent.id,
      data: currentEvent.data,
      raw: currentEvent.raw || '',
      isDone: currentEvent.isDone || false
    })
  }
  
  return events
})
</script>

<script lang="ts">
export default {
  name: 'SseViewer'
}
</script>

<style scoped>
.sse-viewer {
  max-height: 500px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 20px;
  padding: 12px;
}

.sse-events {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sse-event {
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  overflow: hidden;
  background: hsl(var(--background));
}

.sse-event.is-done {
  border-color: #22c55e;
  background: #22c55e10;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: hsl(var(--muted) / 0.5);
  border-bottom: 1px solid hsl(var(--border));
  font-size: 12px;
}

.event-type {
  font-weight: 600;
  color: #0451a5;
  text-transform: uppercase;
}

.event-id {
  color: #666;
  font-size: 11px;
}

.event-index {
  margin-left: auto;
  color: #999;
  font-size: 11px;
}

.event-data {
  padding: 8px;
}

.event-done {
  padding: 12px;
  text-align: center;
}

.done-marker {
  display: inline-block;
  padding: 4px 8px;
  background: #22c55e;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
}

.event-raw {
  padding: 12px;
  background: hsl(var(--muted) / 0.3);
}

.event-raw pre {
  margin: 0;
  font-size: 12px;
  color: #666;
}

/* Dark theme */
.theme-dark .event-type {
  color: #9cdcfe;
}

.theme-dark .event-id {
  color: #d4d4d4;
}

.theme-dark .event-index {
  color: #888;
}

.theme-dark .event-raw pre {
  color: #ccc;
}
</style>