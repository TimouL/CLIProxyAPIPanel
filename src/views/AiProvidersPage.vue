<template>
  <PageContainer>
    <PageHeader
      title="AI 提供商"
      description="配置 AI 提供商 API 密钥和设置"
    >
      <template #actions>
        <Button variant="outline" size="sm" @click="refreshAll" :disabled="loading">
          <RefreshCw :class="['w-4 h-4 mr-2', loading && 'animate-spin']" />
          刷新
        </Button>
      </template>
    </PageHeader>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6">
      <CardSection v-for="i in 4" :key="'skeleton-' + i" class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <Skeleton class="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton class="h-5 w-24 mb-2" />
              <Skeleton class="h-4 w-32" />
            </div>
          </div>
          <Skeleton class="h-8 w-20" />
        </div>
        <Skeleton class="h-16 w-full rounded-lg" />
      </CardSection>
    </div>

    <!-- Providers Sections -->
    <div v-else class="space-y-8">
      <!-- Gemini Section -->
      <Section>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Sparkles class="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">Gemini</h3>
                <p class="text-sm text-muted-foreground">Google Gemini API 密钥</p>
              </div>
              <Badge v-if="geminiKeys.length" variant="secondary">{{ geminiKeys.length }}</Badge>
            </div>
            <Button size="sm" @click="openGeminiDialog()">
              <Plus class="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </template>

        <div v-if="geminiKeys.length === 0" class="text-center py-6 text-muted-foreground">
          暂无 Gemini API 密钥配置
        </div>

        <div v-else class="space-y-2">
          <CardSection
            v-for="(key, index) in geminiKeys"
            :key="index"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-mono text-sm truncate">{{ maskKey(getGeminiKeyValue(key)) }}</div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-if="key.prefix" variant="outline" class="text-xs">前缀: {{ key.prefix }}</Badge>
                  <Badge v-if="key['base-url'] || key.baseUrl" variant="outline" class="text-xs">
                    {{ key['base-url'] || key.baseUrl }}
                  </Badge>
                  <Badge v-if="key['proxy-url'] || key.proxyUrl" variant="outline" class="text-xs">
                    代理: {{ key['proxy-url'] || key.proxyUrl }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" @click="copyToClipboard(getGeminiKeyValue(key))">
                <Copy class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="openGeminiDialog(index)">
                <Pencil class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmDelete('gemini', index)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardSection>
        </div>
      </Section>

      <!-- Claude Section -->
      <Section>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Bot class="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">Claude</h3>
                <p class="text-sm text-muted-foreground">Anthropic Claude API 配置</p>
              </div>
              <Badge v-if="claudeConfigs.length" variant="secondary">{{ claudeConfigs.length }}</Badge>
            </div>
            <Button size="sm" @click="openClaudeDialog()">
              <Plus class="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </template>

        <div v-if="claudeConfigs.length === 0" class="text-center py-6 text-muted-foreground">
          暂无 Claude 配置
        </div>

        <div v-else class="space-y-2">
          <CardSection
            v-for="(config, index) in claudeConfigs"
            :key="index"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-sm font-medium text-orange-600 dark:text-orange-400">
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-mono text-sm truncate">
                  {{ config.sessionKey ? maskKey(config.sessionKey) : (config['session-key'] ? maskKey(config['session-key']) : '无会话密钥') }}
                </div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-if="config.orgId || config['org-id']" variant="outline" class="text-xs">
                    组织: {{ config.orgId || config['org-id'] }}
                  </Badge>
                  <Badge v-if="config['base-url'] || config.baseUrl" variant="outline" class="text-xs">
                    {{ config['base-url'] || config.baseUrl }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" @click="openClaudeDialog(index)">
                <Pencil class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmDelete('claude', index)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardSection>
        </div>
      </Section>

      <!-- Codex Section -->
      <Section>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Code class="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">Codex</h3>
                <p class="text-sm text-muted-foreground">OpenAI Codex API 配置</p>
              </div>
              <Badge v-if="codexConfigs.length" variant="secondary">{{ codexConfigs.length }}</Badge>
            </div>
            <Button size="sm" @click="openCodexDialog()">
              <Plus class="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </template>

        <div v-if="codexConfigs.length === 0" class="text-center py-6 text-muted-foreground">
          暂无 Codex 配置
        </div>

        <div v-else class="space-y-2">
          <CardSection
            v-for="(config, index) in codexConfigs"
            :key="index"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 text-sm font-medium text-purple-600 dark:text-purple-400">
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-mono text-sm truncate">
                  {{ getCodexToken(config) ? maskKey(getCodexToken(config)) : '无令牌' }}
                </div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-if="config['base-url'] || config.baseUrl" variant="outline" class="text-xs">
                    {{ config['base-url'] || config.baseUrl }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" @click="openCodexDialog(index)">
                <Pencil class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmDelete('codex', index)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardSection>
        </div>
      </Section>

      <!-- OpenAI Compatibility Section -->
      <Section>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Cpu class="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">OpenAI 兼容</h3>
                <p class="text-sm text-muted-foreground">OpenAI 兼容提供商配置</p>
              </div>
              <Badge v-if="openaiConfigs.length" variant="secondary">{{ openaiConfigs.length }}</Badge>
            </div>
            <Button size="sm" @click="openOpenAIDialog()">
              <Plus class="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </template>

        <div v-if="openaiConfigs.length === 0" class="text-center py-6 text-muted-foreground">
          暂无 OpenAI 兼容提供商配置
        </div>

        <div v-else class="space-y-2">
          <CardSection
            v-for="(config, index) in openaiConfigs"
            :key="index"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 text-sm font-medium text-green-600 dark:text-green-400">
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sm truncate">{{ config.name || '未命名' }}</div>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" class="text-xs font-mono">
                    {{ config['base-url'] || config.baseUrl || '默认端点' }}
                  </Badge>
                  <Badge v-if="getOpenAIKeyCount(config)" variant="secondary" class="text-xs">
                    {{ getOpenAIKeyCount(config) }} 个密钥
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="sm" @click="openOpenAIDialog(index)">
                <Pencil class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmDelete('openai', index)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardSection>
        </div>
      </Section>
    </div>

    <!-- Gemini Dialog -->
    <Dialog v-model:open="showGeminiDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingIndex !== null ? '编辑' : '添加' }} Gemini API 密钥</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium mb-2">API 密钥 *</label>
            <Input v-model="geminiForm.apiKey" placeholder="输入 Gemini API 密钥" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">前缀 (可选)</label>
            <Input v-model="geminiForm.prefix" placeholder="模型前缀" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Base URL (可选)</label>
            <Input v-model="geminiForm.baseUrl" placeholder="自定义 API 端点" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">代理 URL (可选)</label>
            <Input v-model="geminiForm.proxyUrl" placeholder="代理服务器地址" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showGeminiDialog = false">取消</Button>
          <Button @click="saveGemini" :disabled="!geminiForm.apiKey.trim() || saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ editingIndex !== null ? '更新' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Claude Dialog -->
    <Dialog v-model:open="showClaudeDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingIndex !== null ? '编辑' : '添加' }} Claude 配置</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium mb-2">会话密钥</label>
            <Input v-model="claudeForm.sessionKey" placeholder="输入会话密钥" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">组织 ID (可选)</label>
            <Input v-model="claudeForm.orgId" placeholder="输入组织 ID" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Base URL (可选)</label>
            <Input v-model="claudeForm.baseUrl" placeholder="自定义 API 端点" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showClaudeDialog = false">取消</Button>
          <Button @click="saveClaude" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ editingIndex !== null ? '更新' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Codex Dialog -->
    <Dialog v-model:open="showCodexDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingIndex !== null ? '编辑' : '添加' }} Codex 配置</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium mb-2">访问令牌</label>
            <Input v-model="codexForm.accessToken" placeholder="输入访问令牌" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Base URL (可选)</label>
            <Input v-model="codexForm.baseUrl" placeholder="自定义 API 端点" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showCodexDialog = false">取消</Button>
          <Button @click="saveCodex" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ editingIndex !== null ? '更新' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- OpenAI Dialog -->
    <Dialog v-model:open="showOpenAIDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingIndex !== null ? '编辑' : '添加' }} OpenAI 提供商</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium mb-2">名称 *</label>
            <Input v-model="openaiForm.name" placeholder="提供商名称" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">API 密钥</label>
            <Input v-model="openaiForm.apiKey" placeholder="输入 API 密钥" type="password" />
            <p class="text-xs text-muted-foreground mt-1">可以输入多个密钥，用逗号分隔</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Base URL (可选)</label>
            <Input v-model="openaiForm.baseUrl" placeholder="https://api.openai.com/v1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showOpenAIDialog = false">取消</Button>
          <Button @click="saveOpenAI" :disabled="!openaiForm.name.trim() || saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ editingIndex !== null ? '更新' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除这个配置吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteConfirm = false">取消</Button>
          <Button variant="destructive" @click="executeDelete" :disabled="deleting">
            <Loader2 v-if="deleting" class="w-4 h-4 mr-2 animate-spin" />
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useClipboard } from '@/composables/useClipboard'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Section from '@/components/layout/Section.vue'
import Skeleton from '@/components/ui/skeleton.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Badge from '@/components/ui/badge.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Bot,
  Cpu,
  Code,
  Plus,
  Copy,
  Trash2,
  Loader2,
  Pencil,
  RefreshCw,
} from 'lucide-vue-next'

const { toast } = useToast()
const { copy } = useClipboard()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

// Data
interface GeminiKey {
  'api-key'?: string
  apiKey?: string
  prefix?: string
  'base-url'?: string
  baseUrl?: string
  'proxy-url'?: string
  proxyUrl?: string
}
const geminiKeys = ref<GeminiKey[]>([])
const claudeConfigs = ref<any[]>([])
const codexConfigs = ref<any[]>([])
const openaiConfigs = ref<any[]>([])

// Dialogs
const showGeminiDialog = ref(false)
const showClaudeDialog = ref(false)
const showCodexDialog = ref(false)
const showOpenAIDialog = ref(false)
const showDeleteConfirm = ref(false)

// Edit state
const editingIndex = ref<number | null>(null)
const editingType = ref<'gemini' | 'claude' | 'codex' | 'openai' | null>(null)

// Delete state
const deleteType = ref<'gemini' | 'claude' | 'codex' | 'openai' | null>(null)
const deleteIndex = ref<number | null>(null)

// Forms
const geminiForm = reactive({
  apiKey: '',
  prefix: '',
  baseUrl: '',
  proxyUrl: '',
})

const claudeForm = reactive({
  sessionKey: '',
  orgId: '',
  baseUrl: '',
})

const codexForm = reactive({
  accessToken: '',
  baseUrl: '',
})

const openaiForm = reactive({
  name: '',
  apiKey: '',
  baseUrl: '',
})

// Helpers
function maskKey(key: string): string {
  if (!key || key.length <= 8) return key || ''
  return `${key.substring(0, 4)}${'*'.repeat(Math.min(key.length - 8, 16))}${key.substring(key.length - 4)}`
}

function getGeminiKeyValue(key: GeminiKey): string {
  return key?.['api-key'] || key?.apiKey || ''
}

function getCodexToken(config: any): string {
  return config?.accessToken || config?.['access-token'] || ''
}

function getOpenAIKeyCount(config: any): number {
  const keys = config?.['api-keys'] || config?.apiKeys || []
  return Array.isArray(keys) ? keys.length : 0
}

async function copyToClipboard(text: string) {
  await copy(text)
  toast({ title: '已复制到剪贴板' })
}

// Data fetching
async function fetchAll() {
  loading.value = true
  try {
    const [gemini, claude, openai, codex] = await Promise.allSettled([
      apiClient.get<{ 'gemini-api-key'?: any[] }>('/gemini-api-key'),
      apiClient.get<{ 'claude-api-key'?: any[] }>('/claude-api-key'),
      apiClient.get<{ 'openai-compatibility'?: any[] }>('/openai-compatibility'),
      apiClient.get<{ 'codex-api-key'?: any[] }>('/codex-api-key'),
    ])

    if (gemini.status === 'fulfilled') geminiKeys.value = gemini.value?.['gemini-api-key'] || []
    if (claude.status === 'fulfilled') claudeConfigs.value = claude.value?.['claude-api-key'] || []
    if (openai.status === 'fulfilled') openaiConfigs.value = openai.value?.['openai-compatibility'] || []
    if (codex.status === 'fulfilled') codexConfigs.value = codex.value?.['codex-api-key'] || []
  } finally {
    loading.value = false
  }
}

async function refreshAll() {
  await fetchAll()
  toast({ title: '已刷新' })
}

// Dialog openers
function openGeminiDialog(index?: number) {
  editingIndex.value = index ?? null
  editingType.value = 'gemini'
  if (index !== undefined) {
    const key = geminiKeys.value[index]
    geminiForm.apiKey = getGeminiKeyValue(key)
    geminiForm.prefix = key.prefix || ''
    geminiForm.baseUrl = key['base-url'] || key.baseUrl || ''
    geminiForm.proxyUrl = key['proxy-url'] || key.proxyUrl || ''
  } else {
    geminiForm.apiKey = ''
    geminiForm.prefix = ''
    geminiForm.baseUrl = ''
    geminiForm.proxyUrl = ''
  }
  showGeminiDialog.value = true
}

function openClaudeDialog(index?: number) {
  editingIndex.value = index ?? null
  editingType.value = 'claude'
  if (index !== undefined) {
    const config = claudeConfigs.value[index]
    claudeForm.sessionKey = config.sessionKey || config['session-key'] || ''
    claudeForm.orgId = config.orgId || config['org-id'] || ''
    claudeForm.baseUrl = config['base-url'] || config.baseUrl || ''
  } else {
    claudeForm.sessionKey = ''
    claudeForm.orgId = ''
    claudeForm.baseUrl = ''
  }
  showClaudeDialog.value = true
}

function openCodexDialog(index?: number) {
  editingIndex.value = index ?? null
  editingType.value = 'codex'
  if (index !== undefined) {
    const config = codexConfigs.value[index]
    codexForm.accessToken = getCodexToken(config)
    codexForm.baseUrl = config['base-url'] || config.baseUrl || ''
  } else {
    codexForm.accessToken = ''
    codexForm.baseUrl = ''
  }
  showCodexDialog.value = true
}

function openOpenAIDialog(index?: number) {
  editingIndex.value = index ?? null
  editingType.value = 'openai'
  if (index !== undefined) {
    const config = openaiConfigs.value[index]
    openaiForm.name = config.name || ''
    const keys = config['api-keys'] || config.apiKeys || []
    openaiForm.apiKey = Array.isArray(keys) ? keys.join(', ') : ''
    openaiForm.baseUrl = config['base-url'] || config.baseUrl || ''
  } else {
    openaiForm.name = ''
    openaiForm.apiKey = ''
    openaiForm.baseUrl = ''
  }
  showOpenAIDialog.value = true
}

// Save functions
async function saveGemini() {
  saving.value = true
  try {
    const newKey: GeminiKey = {
      'api-key': geminiForm.apiKey.trim(),
    }
    if (geminiForm.prefix.trim()) newKey.prefix = geminiForm.prefix.trim()
    if (geminiForm.baseUrl.trim()) newKey['base-url'] = geminiForm.baseUrl.trim()
    if (geminiForm.proxyUrl.trim()) newKey['proxy-url'] = geminiForm.proxyUrl.trim()

    let newKeys: GeminiKey[]
    if (editingIndex.value !== null) {
      newKeys = [...geminiKeys.value]
      newKeys[editingIndex.value] = newKey
    } else {
      newKeys = [...geminiKeys.value, newKey]
    }

    await apiClient.put('/gemini-api-key', { items: newKeys })
    toast({ title: editingIndex.value !== null ? 'Gemini 密钥已更新' : 'Gemini 密钥已添加' })
    showGeminiDialog.value = false
    await fetchAll()
  } catch {
    toast({ title: '保存失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

async function saveClaude() {
  saving.value = true
  try {
    const config: any = {}
    if (claudeForm.sessionKey.trim()) config['session-key'] = claudeForm.sessionKey.trim()
    if (claudeForm.orgId.trim()) config['org-id'] = claudeForm.orgId.trim()
    if (claudeForm.baseUrl.trim()) config['base-url'] = claudeForm.baseUrl.trim()

    if (editingIndex.value !== null) {
      const newConfigs = [...claudeConfigs.value]
      newConfigs[editingIndex.value] = config
      await apiClient.put('/claude-api-key', { items: newConfigs })
    } else {
      await apiClient.post('/claude-api-key', config)
    }
    toast({ title: editingIndex.value !== null ? 'Claude 配置已更新' : 'Claude 配置已添加' })
    showClaudeDialog.value = false
    await fetchAll()
  } catch {
    toast({ title: '保存失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

async function saveCodex() {
  saving.value = true
  try {
    const config: any = {}
    if (codexForm.accessToken.trim()) config['access-token'] = codexForm.accessToken.trim()
    if (codexForm.baseUrl.trim()) config['base-url'] = codexForm.baseUrl.trim()

    if (editingIndex.value !== null) {
      const newConfigs = [...codexConfigs.value]
      newConfigs[editingIndex.value] = config
      await apiClient.put('/codex-api-key', { items: newConfigs })
    } else {
      await apiClient.post('/codex-api-key', config)
    }
    toast({ title: editingIndex.value !== null ? 'Codex 配置已更新' : 'Codex 配置已添加' })
    showCodexDialog.value = false
    await fetchAll()
  } catch {
    toast({ title: '保存失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

async function saveOpenAI() {
  saving.value = true
  try {
    const keys = openaiForm.apiKey.split(',').map(k => k.trim()).filter(Boolean)
    const config: any = {
      name: openaiForm.name.trim(),
    }
    if (keys.length) config['api-keys'] = keys
    if (openaiForm.baseUrl.trim()) config['base-url'] = openaiForm.baseUrl.trim()

    if (editingIndex.value !== null) {
      const newConfigs = [...openaiConfigs.value]
      newConfigs[editingIndex.value] = config
      await apiClient.put('/openai-compatibility', { items: newConfigs })
    } else {
      await apiClient.post('/openai-compatibility', config)
    }
    toast({ title: editingIndex.value !== null ? 'OpenAI 提供商已更新' : 'OpenAI 提供商已添加' })
    showOpenAIDialog.value = false
    await fetchAll()
  } catch {
    toast({ title: '保存失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

// Delete functions
function confirmDelete(type: 'gemini' | 'claude' | 'codex' | 'openai', index: number) {
  deleteType.value = type
  deleteIndex.value = index
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (deleteType.value === null || deleteIndex.value === null) return
  deleting.value = true
  try {
    const endpoints: Record<string, string> = {
      gemini: '/gemini-api-key',
      claude: '/claude-api-key',
      codex: '/codex-api-key',
      openai: '/openai-compatibility',
    }
    await apiClient.delete(`${endpoints[deleteType.value]}?index=${deleteIndex.value}`)
    toast({ title: '已删除' })
    showDeleteConfirm.value = false
    await fetchAll()
  } catch {
    toast({ title: '删除失败', variant: 'destructive' })
  } finally {
    deleting.value = false
    deleteType.value = null
    deleteIndex.value = null
  }
}

onMounted(fetchAll)
</script>
