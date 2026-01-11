<template>
  <PageContainer>
    <!-- 操作按钮区域 -->
    <div class="flex justify-end mb-4">
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="resetConfig" :disabled="!hasChanges">
          重置
        </Button>
        <Button @click="saveConfig" :disabled="saving || !hasChanges">
          <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
          <Save v-else class="w-4 h-4 mr-2" />
          保存更改
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- View Mode Toggle -->
      <div class="flex items-center gap-4 mb-6">
        <Button
          :variant="viewMode === 'visual' ? 'default' : 'outline'"
          size="sm"
          @click="viewMode = 'visual'"
        >
          <Settings class="w-4 h-4 mr-2" />
          可视化编辑器
        </Button>
        <Button
          :variant="viewMode === 'yaml' ? 'default' : 'outline'"
          size="sm"
          @click="viewMode = 'yaml'"
        >
          <FileCode class="w-4 h-4 mr-2" />
          YAML 编辑器
        </Button>
      </div>

      <!-- Visual Editor -->
      <div v-if="viewMode === 'visual'" class="space-y-6">
        <!-- Server Settings -->
        <Section title="服务器设置">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">主机</label>
              <Input v-model="config.host" placeholder="0.0.0.0" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">端口</label>
              <Input v-model.number="config.port" type="number" placeholder="8080" />
            </div>
          </div>
        </Section>

        <!-- Feature Toggles -->
        <Section title="功能">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSection class="flex items-center justify-between">
              <div>
                <div class="font-medium text-foreground">调试模式</div>
                <div class="text-xs text-muted-foreground">启用详细日志</div>
              </div>
              <Switch v-model="config.debug" />
            </CardSection>

            <CardSection class="flex items-center justify-between">
              <div>
                <div class="font-medium text-foreground">用量统计</div>
                <div class="text-xs text-muted-foreground">跟踪 API 使用情况</div>
              </div>
              <Switch v-model="config['usage-statistics-enabled']" />
            </CardSection>

            <CardSection class="flex items-center justify-between">
              <div>
                <div class="font-medium text-foreground">文件日志</div>
                <div class="text-xs text-muted-foreground">将日志写入文件</div>
              </div>
              <Switch v-model="config['logging-to-file']" />
            </CardSection>

            <CardSection class="flex items-center justify-between">
              <div>
                <div class="font-medium text-foreground">WebSocket 认证</div>
                <div class="text-xs text-muted-foreground">要求 WS 认证</div>
              </div>
              <Switch v-model="config['ws-auth']" />
            </CardSection>
          </div>
        </Section>

        <!-- Request Settings -->
        <Section title="请求设置">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">重试次数</label>
              <Input v-model.number="config['request-retry']" type="number" min="0" max="10" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">代理 URL</label>
              <Input v-model="config['proxy-url']" placeholder="http://proxy:8080" />
            </div>
          </div>
        </Section>
      </div>

      <!-- YAML Editor with CodeMirror -->
      <CardSection v-else class="overflow-hidden">
        <!-- Editor Toolbar -->
        <div class="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <FileCode class="w-4 h-4" />
            <span>config.yaml</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="搜索 (Ctrl+F)"
              @click="focusSearch"
            >
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- CodeMirror Editor -->
        <div class="yaml-editor-container">
          <Codemirror
            v-model="yamlContent"
            :style="{ minHeight: '500px' }"
            :extensions="extensions"
            :autofocus="true"
            placeholder="# 在此编辑 YAML 配置..."
          />
        </div>
      </CardSection>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useDarkMode } from '@/composables/useDarkMode'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Section from '@/components/layout/Section.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Switch from '@/components/ui/switch.vue'
import {
  Save,
  Settings,
  FileCode,
  Loader2,
  Search,
} from 'lucide-vue-next'

// CodeMirror imports
import { Codemirror } from 'vue-codemirror'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'
import { search, searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { keymap } from '@codemirror/view'
import { EditorView } from '@codemirror/view'

interface Config {
  host?: string
  port?: number
  debug?: boolean
  'usage-statistics-enabled'?: boolean
  'logging-to-file'?: boolean
  'ws-auth'?: boolean
  'request-retry'?: number
  'proxy-url'?: string
  [key: string]: any
}

const { toast } = useToast()
const { isDark } = useDarkMode()

const loading = ref(true)
const saving = ref(false)
const viewMode = ref<'visual' | 'yaml'>('visual')
const config = ref<Config>({})
const originalConfig = ref<Config>({})
const yamlContent = ref('')

// CodeMirror extensions
const extensions = computed(() => {
  const baseExtensions = [
    yaml(),
    search(),
    highlightSelectionMatches(),
    keymap.of(searchKeymap),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        fontSize: '14px',
      },
      '.cm-content': {
        padding: '16px 0',
      },
      '.cm-line': {
        padding: '0 16px',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        border: 'none',
        paddingRight: '8px',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
      },
      '.cm-activeLine': {
        backgroundColor: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      },
      '.cm-selectionBackground': {
        backgroundColor: isDark.value ? 'rgba(204,120,92,0.3)' : 'rgba(204,120,92,0.2)',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: isDark.value ? 'rgba(204,120,92,0.3)' : 'rgba(204,120,92,0.2)',
      },
      '.cm-cursor': {
        borderLeftColor: isDark.value ? '#cc785c' : '#cc785c',
      },
    }),
  ]
  
  // Add dark theme if in dark mode
  if (isDark.value) {
    baseExtensions.push(oneDark)
  }
  
  return baseExtensions
})

const hasChanges = computed(() => {
  return JSON.stringify(config.value) !== JSON.stringify(originalConfig.value)
})

async function fetchConfig() {
  loading.value = true
  try {
    const data = await apiClient.get<Config>('/config')
    config.value = { ...data }
    originalConfig.value = { ...data }
    yamlContent.value = configToYaml(data)
  } catch {
    toast({ title: '加载配置失败', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

function configToYaml(obj: Config): string {
  const lines: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'object') {
      lines.push(`${key}:`)
      for (const [k, v] of Object.entries(value)) {
        lines.push(`  ${k}: ${JSON.stringify(v)}`)
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`)
    }
  }
  return lines.join('\n')
}

function resetConfig() {
  config.value = { ...originalConfig.value }
  yamlContent.value = configToYaml(originalConfig.value)
}

async function saveConfig() {
  saving.value = true
  try {
    // Backend expects YAML format via PUT /config.yaml
    const yamlToSave = viewMode.value === 'yaml' ? yamlContent.value : configToYaml(config.value)
    await apiClient.put('/config.yaml', yamlToSave, {
      headers: { 'Content-Type': 'text/plain' }
    })
    originalConfig.value = { ...config.value }
    toast({ title: '配置已保存' })
  } catch {
    toast({ title: '保存配置失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

function focusSearch() {
  // Trigger search panel - this opens the CodeMirror search dialog
  const editor = document.querySelector('.cm-content') as HTMLElement
  if (editor) {
    editor.focus()
    // Dispatch Ctrl+F event to open search
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      bubbles: true,
    })
    editor.dispatchEvent(event)
  }
}

// Sync visual editor changes to YAML
watch(config, (newConfig) => {
  if (viewMode.value === 'visual') {
    yamlContent.value = configToYaml(newConfig)
  }
}, { deep: true })

onMounted(fetchConfig)
</script>

<style>
/* CodeMirror editor styling */
.yaml-editor-container .cm-editor {
  background-color: transparent;
}

.yaml-editor-container .cm-scroller {
  min-height: 500px;
}

/* Light mode styles */
:root:not(.dark) .yaml-editor-container .cm-editor {
  background-color: #fafaf9;
}

:root:not(.dark) .yaml-editor-container .cm-gutters {
  background-color: #f5f5f4;
  color: #a3a3a3;
}

/* Dark mode styles */
.dark .yaml-editor-container .cm-editor {
  background-color: #1a1a1a;
}

.dark .yaml-editor-container .cm-gutters {
  background-color: #1f1f1f;
  color: #6b6b6b;
}

/* Search panel styling */
.cm-panel.cm-search {
  background-color: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 8px;
}

.cm-panel.cm-search input {
  background-color: var(--input);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--foreground);
}

.cm-panel.cm-search button {
  background-color: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--foreground);
  cursor: pointer;
}

.cm-panel.cm-search button:hover {
  background-color: var(--accent);
}
</style>
