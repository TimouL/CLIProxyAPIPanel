<template>
  <div
    class="urlencoded-viewer"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="params-list">
      <div
        v-for="(value, key) in data"
        :key="key"
        class="param-item"
      >
        <div class="param-key">{{ key }}</div>
        <div class="param-equals">=</div>
        <div class="param-value">{{ value || '(empty)' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: Record<string, string>
  isDark: boolean
}>()
</script>

<script lang="ts">
export default {
  name: 'UrlEncodedViewer'
}
</script>

<style scoped>
.urlencoded-viewer {
  max-height: 500px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 20px;
  padding: 12px;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border) / 0.5);
}

.param-item:hover {
  background: hsl(var(--muted) / 0.5);
}

.param-key {
  font-weight: 600;
  color: #0451a5;
  min-width: 100px;
  flex-shrink: 0;
}

.param-equals {
  color: #666;
  flex-shrink: 0;
}

.param-value {
  color: #a31515;
  word-break: break-all;
  flex: 1;
}

.param-value:empty::after {
  content: '(empty)';
  color: #999;
  font-style: italic;
}

/* Dark theme */
.theme-dark .param-key {
  color: #9cdcfe;
}

.theme-dark .param-equals {
  color: #d4d4d4;
}

.theme-dark .param-value {
  color: #ce9178;
}
</style>