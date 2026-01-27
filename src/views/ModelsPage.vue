<template>
  <PageContainer>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div class="relative w-full sm:w-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="搜索模型..."
          class="pl-9 h-9 w-full sm:w-72"
        />
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          :disabled="loading"
          class="hover:scale-105 transition-all duration-200"
          @click="fetchModels({ forceRefresh: true })"
        >
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
          刷新
        </Button>
        <Button variant="outline" class="hover:scale-105 transition-all duration-200" @click="router.push('/api-keys')">
          <Key class="w-4 h-4 mr-2" />
          API 密钥
        </Button>
      </div>
    </div>

    <CardSection
      title="可用模型"
      description="通过 /v1/models 获取，用于核对服务端实际暴露的模型列表。点击模型可复制。"
    >
      <div class="flex flex-col gap-4">
        <div class="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <div class="rounded-xl border border-border bg-card/50 p-4">
            <div class="text-xs text-muted-foreground mb-1">Endpoint</div>
            <div class="text-xs font-mono break-all">{{ modelsEndpoint || '-' }}</div>
          </div>
          <div class="rounded-xl border border-border bg-card/50 p-4">
            <div class="text-xs text-muted-foreground mb-1">鉴权 API Key</div>
            <div class="text-xs font-mono break-all">{{ apiKeyMasked }}</div>
          </div>
          <div class="rounded-xl border border-border bg-card/50 p-4">
            <div class="text-xs text-muted-foreground mb-1">数量</div>
            <div class="text-sm font-semibold">{{ filteredModels.length }}</div>
          </div>
        </div>

        <div v-if="error" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {{ error }}
        </div>

        <div v-else-if="loading" class="py-12 text-center text-muted-foreground">
          <RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
          正在加载模型列表...
        </div>

        <div v-else-if="filteredModels.length === 0" class="py-12 text-center text-muted-foreground">
          <div class="text-sm mb-1">暂无模型数据</div>
          <div class="text-xs">请确认服务端可访问且已配置至少一个可用的 API Key</div>
        </div>

        <div v-else class="space-y-6">
          <div v-for="group in groupedModels" :key="group.id" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="text-sm font-semibold text-foreground">{{ group.label }}</div>
                <Badge variant="secondary" class="text-[10px] px-2 h-5">{{ group.items.length }}</Badge>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="model in group.items"
                :key="`${model.name}-${model.alias ?? 'default'}`"
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/30 px-3 py-1.5 text-xs font-mono text-foreground hover:bg-secondary/60 hover:border-primary/40 transition-colors"
                :title="model.description || model.alias || model.name"
                @click="copyModelId(model.name)"
              >
                <span class="font-semibold">{{ model.name }}</span>
                <span v-if="model.alias" class="text-muted-foreground">{{ model.alias }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CardSection>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Button from '@/components/ui/button.vue'
import Badge from '@/components/ui/badge.vue'
import Input from '@/components/ui/input.vue'
import { classifyModels, normalizeModelList, type ModelInfo } from '@/utils/models'
import { Key, RefreshCw, Search } from 'lucide-vue-next'
import type { ApiKeyEntry, RawApiKey } from '@/types/apiKey'

const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()
const { copy } = useClipboard()
const { toast } = useToast()

const loading = ref(false)
const error = ref<string | null>(null)
const models = ref<ModelInfo[]>([])
const searchQuery = ref('')

const apiKeyUsed = ref<string | null>(null)
let apiKeysCache: string[] | null = null

function normalizeBaseUrl(baseUrl: string): string {
  let normalized = String(baseUrl || '').trim()
  if (!normalized) return ''
  normalized = normalized.replace(/\/?v0\/management\/?$/i, '')
  normalized = normalized.replace(/\/+$/g, '')
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`
  }
  return normalized
}

const modelsEndpoint = computed(() => {
  const baseFromClient = apiClient.getConfig().apiBase
  const base = normalizeBaseUrl(baseFromClient || authStore.apiBase)
  return base ? `${base}/v1/models` : ''
})

function maskKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return '-'
  if (trimmed.length <= 10) return trimmed
  return `${trimmed.slice(0, 4)}***${trimmed.slice(-4)}`
}

const apiKeyMasked = computed(() => (apiKeyUsed.value ? maskKey(apiKeyUsed.value) : '-'))

const filteredModels = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return models.value
  return models.value.filter((model) => {
    const haystack = `${model.name} ${model.alias ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const groupedModels = computed(() => classifyModels(filteredModels.value, { otherLabel: '其他' }))

function normalizeApiKeyEntries(input: unknown): Array<{ key: string; isActive: boolean | null }> {
  if (!Array.isArray(input)) return []
  const entries: Array<{ key: string; isActive: boolean | null }> = []
  for (const item of input as RawApiKey[]) {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed) entries.push({ key: trimmed, isActive: null })
      continue
    }
    if (!item || typeof item !== 'object') continue
    const raw = item as Partial<ApiKeyEntry> & Record<string, unknown>
    const key = String((raw as any)['api-key'] ?? (raw as any).apiKey ?? '').trim()
    if (!key) continue
    const activeVal = (raw as any)['is-active'] ?? (raw as any).isActive
    const isActive = typeof activeVal === 'boolean' ? activeVal : null
    entries.push({ key, isActive })
  }

  const seen = new Set<string>()
  return entries.filter((entry) => {
    const normalized = entry.key.trim()
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

async function resolveApiKeys(forceRefresh: boolean): Promise<string[]> {
  if (!forceRefresh && apiKeysCache?.length) return apiKeysCache

  try {
    const cfg = await configStore.fetchConfig(undefined, forceRefresh)
    const keys = normalizeApiKeyEntries((cfg as any)?.apiKeys)
      .map((entry) => entry.key)
      .filter(Boolean)
    if (keys.length) {
      apiKeysCache = keys
      return keys
    }
  } catch {
    // ignore - fallback to managed api-keys
  }

  try {
    const data = await apiClient.get<{ 'api-keys'?: RawApiKey[] }>('/api-keys')
    const entries = normalizeApiKeyEntries(data?.['api-keys'])
    const active = entries.filter((e) => e.isActive === true).map((e) => e.key)
    const all = entries.map((e) => e.key)
    apiKeysCache = active.length ? active : all
    return apiKeysCache
  } catch {
    return []
  }
}

async function fetchModels(opts: { forceRefresh?: boolean } = {}) {
  const forceRefresh = Boolean(opts.forceRefresh)
  if (!authStore.isConnected) {
    error.value = '未连接到服务器，请先连接后再获取模型列表'
    return
  }
  if (!modelsEndpoint.value) {
    error.value = '服务器地址无效，无法构造 /v1/models endpoint'
    return
  }

  loading.value = true
  error.value = null

  try {
    const apiKeys = await resolveApiKeys(forceRefresh)
    const apiKey = apiKeys[0] || ''
    apiKeyUsed.value = apiKey || null

    const headers: Record<string, string> = {}
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    const resp = await fetch(modelsEndpoint.value, {
      method: 'GET',
      headers: Object.keys(headers).length ? headers : undefined,
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`)
    }
    const payload = await resp.json().catch(() => null)
    const list = normalizeModelList(payload, { dedupe: true })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
    models.value = list
  } catch (err) {
    models.value = []
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function copyModelId(id: string) {
  const ok = await copy(id)
  if (ok) {
    toast({ title: '已复制模型 ID', description: id })
  } else {
    toast({ title: '复制失败', variant: 'destructive' })
  }
}

onMounted(() => {
  fetchModels().catch(() => {
    // ignore
  })
})
</script>

