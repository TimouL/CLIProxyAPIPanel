<template>
  <div
    class="headers-viewer"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="headers-list">
      <div
        v-for="(value, key) in data"
        :key="key"
        class="header-item"
      >
        <div class="header-key">{{ key }}:</div>
        <div class="header-value">{{ value }}</div>
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
  name: 'HeadersViewer'
}
</script>

<style scoped>
.headers-viewer {
  max-height: 500px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 20px;
  padding: 12px;
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.3);
  border: 1px solid hsl(var(--border) / 0.5);
}

.header-item:hover {
  background: hsl(var(--muted) / 0.5);
}

.header-key {
  font-weight: 600;
  color: #0451a5;
  min-width: 120px;
  flex-shrink: 0;
}

.header-value {
  color: #a31515;
  word-break: break-all;
  flex: 1;
}

/* Dark theme */
.theme-dark .header-key {
  color: #9cdcfe;
}

.theme-dark .header-value {
  color: #ce9178;
}
</style>