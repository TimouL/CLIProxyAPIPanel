<template>
  <PageContainer>
    <PageHeader
      title="API 密钥"
      description="管理代理 API 密钥"
    >
      <template #actions>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="refreshKeys" :disabled="loading">
            <RefreshCw :class="['w-4 h-4 mr-2', loading && 'animate-spin']" />
            刷新
          </Button>
          <Button @click="openAddDialog">
            <Plus class="w-4 h-4 mr-2" />
            添加密钥
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- 主卡片容器 -->
    <Card variant="default" class="overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="py-16 text-center space-y-4">
        <Skeleton class="mx-auto h-10 w-10 rounded-full" />
        <Skeleton class="mx-auto h-4 w-32" />
      </div>

      <div v-else>
        <!-- 工具栏: 搜索、筛选、统计 -->
        <div class="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-border/60">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div class="shrink-0">
              <h3 class="text-sm sm:text-base font-semibold">
                代理 API 密钥
              </h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                活跃 {{ activeCount }} · 禁用 {{ inactiveCount }} · 共 {{ apiKeys.length }} 个
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <!-- 搜索框 -->
              <div class="relative">
                <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索密钥..."
                  class="h-8 w-28 sm:w-40 pl-8 pr-2 text-xs"
                />
              </div>

              <!-- 分隔线 -->
              <div class="hidden sm:block h-4 w-px bg-border" />

              <!-- 状态筛选 -->
              <Select v-model="filterStatus">
                <SelectTrigger class="w-20 sm:w-28 h-8 text-xs border-border/60">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in statusFilters"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredApiKeys.length === 0" class="py-16 text-center">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Key class="h-8 w-8 text-muted-foreground" />
            </div>
            <div v-if="hasActiveFilters">
              <h3 class="text-lg font-semibold">
                未找到匹配的密钥
              </h3>
              <p class="mt-2 text-sm text-muted-foreground">
                尝试调整筛选条件
              </p>
              <Button
                variant="outline"
                size="sm"
                class="mt-3"
                @click="clearFilters"
              >
                清除筛选
              </Button>
            </div>
            <div v-else>
              <h3 class="text-lg font-semibold">
                暂无 API 密钥
              </h3>
              <p class="mt-2 text-sm text-muted-foreground">
                点击右上角按钮创建第一个密钥
              </p>
            </div>
          </div>
        </div>

        <!-- 密钥列表 - 桌面表格视图 -->
        <div class="hidden xl:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow class="border-b border-border/60 hover:bg-transparent">
                <TableHead class="w-[50px] h-12 font-semibold text-center">
                  #
                </TableHead>
                <TableHead class="w-[200px] h-12 font-semibold">
                  密钥信息
                </TableHead>
                <TableHead class="w-[150px] h-12 font-semibold">
                  名称
                </TableHead>
                <TableHead class="w-[100px] h-12 font-semibold text-center">
                  使用次数
                </TableHead>
                <TableHead class="w-[150px] h-12 font-semibold">
                  最近使用
                </TableHead>
                <TableHead class="w-[70px] h-12 font-semibold text-center">
                  状态
                </TableHead>
                <TableHead class="w-[130px] h-12 font-semibold text-center">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(apiKey, index) in filteredApiKeys"
                :key="apiKey.id"
                class="border-b border-border/40 hover:bg-muted/30 transition-colors"
              >
                <TableCell class="py-4 text-center">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mx-auto">
                    {{ index + 1 }}
                  </div>
                </TableCell>
                <TableCell class="py-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5">
                      <code class="text-xs font-mono text-muted-foreground">
                        {{ apiKey.keyDisplay }}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        title="复制完整密钥"
                        @click="copyKey(apiKey.key)"
                      >
                        <Copy class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-sm" :class="apiKey.name ? 'text-foreground' : 'text-muted-foreground italic'">
                      {{ apiKey.name || '未命名' }}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      title="编辑名称"
                      @click="openEditNameDialog(apiKey)"
                    >
                      <Pencil class="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell class="py-4 text-center">
                  <span class="font-medium text-foreground">
                    {{ apiKey.usageCount.toLocaleString() }}
                  </span>
                </TableCell>
                <TableCell class="py-4">
                  <div class="text-xs">
                    <span v-if="apiKey.lastUsedAt" class="text-foreground">
                      {{ formatDate(apiKey.lastUsedAt) }}
                    </span>
                    <span v-else class="text-muted-foreground">
                      暂无记录
                    </span>
                  </div>
                </TableCell>
                <TableCell class="py-4 text-center">
                  <Switch
                    :model-value="apiKey.isActive"
                    :disabled="togglingId === apiKey.id"
                    @update:model-value="toggleKeyActive(apiKey)"
                  />
                </TableCell>
                <TableCell class="py-4">
                  <div class="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      title="编辑密钥"
                      @click="openEditDialog(apiKey)"
                    >
                      <SquarePen class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="删除"
                      @click="confirmDelete(apiKey)"
                      :disabled="deletingId === apiKey.id"
                    >
                      <Loader2 v-if="deletingId === apiKey.id" class="h-4 w-4 animate-spin" />
                      <Trash2 v-else class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- 密钥列表 - 移动端卡片视图 -->
        <div class="xl:hidden divide-y divide-border/40">
          <div
            v-for="(apiKey, index) in filteredApiKeys"
            :key="apiKey.id"
            class="p-4 sm:p-5 hover:bg-muted/30 transition-colors"
          >
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {{ index + 1 }}
                    </div>
                    <code class="inline-flex rounded-lg bg-muted px-3 py-1.5 text-xs font-mono font-semibold">
                      {{ apiKey.keyDisplay }}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 hover:bg-muted flex-shrink-0"
                      title="复制完整密钥"
                      @click="copyKey(apiKey.key)"
                    >
                      <Copy class="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div
                    class="text-sm font-semibold"
                    :class="apiKey.name ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ apiKey.name || '未命名密钥' }}
                  </div>
                </div>
                <Switch
                  :model-value="apiKey.isActive"
                  :disabled="togglingId === apiKey.id"
                  @update:model-value="toggleKeyActive(apiKey)"
                />
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2 bg-muted/40 rounded-lg">
                  <div class="text-muted-foreground mb-1">
                    使用次数
                  </div>
                  <div class="font-semibold">
                    {{ apiKey.usageCount.toLocaleString() }}
                  </div>
                </div>
                <div class="p-2 bg-muted/40 rounded-lg">
                  <div class="text-muted-foreground mb-1">
                    最近使用
                  </div>
                  <div class="font-semibold">
                    {{ apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : '暂无' }}
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1"
                  @click="openEditNameDialog(apiKey)"
                >
                  <Pencil class="h-3.5 w-3.5 mr-1.5" />
                  名称
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1"
                  @click="openEditDialog(apiKey)"
                >
                  <SquarePen class="h-3.5 w-3.5 mr-1.5" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-red-500"
                  @click="confirmDelete(apiKey)"
                  :disabled="deletingId === apiKey.id"
                >
                  <Loader2 v-if="deletingId === apiKey.id" class="h-3.5 w-3.5 animate-spin" />
                  <Trash2 v-else class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Add/Edit Key Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEditing ? '编辑 API 密钥' : '添加 API 密钥' }}</DialogTitle>
          <DialogDescription>
            {{ isEditing ? '修改现有的 API 密钥' : '创建新的 API 密钥用于客户端访问' }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">API 密钥</label>
            <Input
              v-model="formKey"
              :placeholder="isEditing ? '输入新的 API 密钥' : '输入 API 密钥或留空自动生成'"
              :disabled="saving"
            />
            <p v-if="formError" class="text-xs text-red-500 mt-1">{{ formError }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">名称 (可选)</label>
            <Input
              v-model="formName"
              placeholder="例如: 开发环境, 生产环境"
              :disabled="saving"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeDialog" :disabled="saving">取消</Button>
          <Button @click="handleSave" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? '更新' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Name Dialog -->
    <Dialog v-model:open="showNameDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑密钥名称</DialogTitle>
          <DialogDescription>
            设置一个便于识别的名称
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">名称</label>
            <Input
              v-model="editingName"
              placeholder="例如: 开发环境, 生产环境"
              :disabled="savingName"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showNameDialog = false" :disabled="savingName">取消</Button>
          <Button @click="saveKeyName" :disabled="savingName">
            <Loader2 v-if="savingName" class="w-4 h-4 mr-2 animate-spin" />
            保存
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
            确定要删除这个 API 密钥吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="p-3 bg-muted/30 rounded-lg font-mono text-sm break-all">
            {{ deleteTargetKey?.keyDisplay || '' }}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="cancelDelete">取消</Button>
          <Button variant="destructive" @click="executeDelete">
            <Loader2 v-if="deletingId" class="w-4 h-4 mr-2 animate-spin" />
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useClipboard } from '@/composables/useClipboard'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import {
  Card,
  Button,
  Input,
  Switch,
  Skeleton,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  SquarePen,
} from 'lucide-vue-next'
import type { ApiKeyEntry, ApiKeyInfo } from '@/types'

const { toast } = useToast()
const { copy } = useClipboard()

// State
const loading = ref(true)
const rawApiKeys = ref<ApiKeyEntry[]>([])
const showDialog = ref(false)
const formKey = ref('')
const formName = ref('')
const formError = ref('')
const saving = ref(false)
const editingApiKey = ref<ApiKeyInfo | null>(null)

// 名称编辑
const showNameDialog = ref(false)
const editingNameId = ref<string | null>(null)
const editingName = ref('')
const savingName = ref(false)

// Toggle state
const togglingId = ref<string | null>(null)

// Delete confirmation
const showDeleteConfirm = ref(false)
const deleteTargetKey = ref<ApiKeyInfo | null>(null)
const deletingId = ref<string | null>(null)

// 筛选
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

const statusFilters = [
  { value: 'all' as const, label: '全部状态' },
  { value: 'active' as const, label: '活跃' },
  { value: 'inactive' as const, label: '禁用' }
]

// Computed
const isEditing = computed(() => editingApiKey.value !== null)

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || filterStatus.value !== 'all'
})

// 转换后端数据为前端显示格式
const apiKeys = computed<ApiKeyInfo[]>(() => {
  return rawApiKeys.value.map(raw => {
    const key = raw['api-key'] || ''
    return {
      id: raw.id || '',
      key,
      keyDisplay: maskKey(key),
      name: raw.name || '',
      isActive: raw['is-active'] ?? true,
      usageCount: raw['usage-count'] || 0,
      lastUsedAt: raw['last-used-at'] || null,
      createdAt: raw['created-at'] || null
    }
  })
})

// 筛选后的密钥列表
const filteredApiKeys = computed(() => {
  let result = apiKeys.value

  // 搜索筛选
  if (searchQuery.value) {
    const keywords = searchQuery.value.toLowerCase().split(/\s+/).filter(k => k.length > 0)
    result = result.filter(key => {
      const searchableText = `${key.name} ${key.key}`.toLowerCase()
      return keywords.every(keyword => searchableText.includes(keyword))
    })
  }

  // 状态筛选
  if (filterStatus.value === 'active') {
    result = result.filter(key => key.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(key => !key.isActive)
  }

  return result
})

const activeCount = computed(() => apiKeys.value.filter(key => key.isActive).length)
const inactiveCount = computed(() => apiKeys.value.length - activeCount.value)

// Helpers
function maskKey(key: string): string {
  if (key.length <= 8) return key
  return `${key.substring(0, 4)}${'*'.repeat(Math.min(key.length - 8, 20))}${key.substring(key.length - 4)}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 验证 API 密钥字符
function isValidApiKeyCharset(key: string): boolean {
  return /^[\w-]+$/.test(key)
}

async function copyKey(key: string) {
  await copy(key)
  toast({ title: '已复制到剪贴板' })
}

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = 'all'
}

async function fetchKeys() {
  loading.value = true
  try {
    const data = await apiClient.get<{ 'api-keys'?: ApiKeyEntry[] }>('/api-keys')
    const keys = data?.['api-keys'] ?? []
    rawApiKeys.value = Array.isArray(keys) ? keys : []
  } catch {
    toast({ title: '加载 API 密钥失败', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

async function refreshKeys() {
  await fetchKeys()
  toast({ title: '已刷新' })
}

function openAddDialog() {
  editingApiKey.value = null
  formKey.value = ''
  formName.value = ''
  formError.value = ''
  showDialog.value = true
}

function openEditDialog(apiKey: ApiKeyInfo) {
  editingApiKey.value = apiKey
  formKey.value = apiKey.key
  formName.value = apiKey.name
  formError.value = ''
  showDialog.value = true
}

function openEditNameDialog(apiKey: ApiKeyInfo) {
  editingNameId.value = apiKey.id
  editingName.value = apiKey.name
  showNameDialog.value = true
}

async function saveKeyName() {
  if (!editingNameId.value) return

  savingName.value = true
  try {
    await apiClient.patch('/api-keys', {
      id: editingNameId.value,
      name: editingName.value.trim()
    })
    toast({ title: '名称已更新' })
    await fetchKeys()
  } catch {
    toast({ title: '更新名称失败', variant: 'destructive' })
  } finally {
    savingName.value = false
    showNameDialog.value = false
    editingNameId.value = null
    editingName.value = ''
  }
}

async function toggleKeyActive(apiKey: ApiKeyInfo) {
  togglingId.value = apiKey.id
  try {
    const newState = !apiKey.isActive
    await apiClient.patch('/api-keys', {
      id: apiKey.id,
      'is-active': newState
    })
    toast({ title: newState ? '密钥已启用' : '密钥已禁用' })
    await fetchKeys()
  } catch {
    toast({ title: '切换状态失败', variant: 'destructive' })
  } finally {
    togglingId.value = null
  }
}

function closeDialog() {
  showDialog.value = false
  formKey.value = ''
  formName.value = ''
  formError.value = ''
  editingApiKey.value = null
}

async function handleSave() {
  const trimmedKey = formKey.value.trim()
  
  // 编辑模式必须有值
  if (isEditing.value && !trimmedKey) {
    formError.value = '请输入 API 密钥'
    return
  }

  // 如果有值，验证字符
  if (trimmedKey && !isValidApiKeyCharset(trimmedKey)) {
    formError.value = 'API 密钥只能包含字母、数字、下划线和横杠'
    return
  }

  formError.value = ''
  saving.value = true

  try {
    if (isEditing.value && editingApiKey.value) {
      // 更新密钥 - 使用 PATCH 接口，通过 ID 定位
      const patchPayload: Record<string, string> = {
        id: editingApiKey.value.id
      }
      
      // 如果密钥值变了
      if (trimmedKey !== editingApiKey.value.key) {
        patchPayload['api-key'] = trimmedKey
      }
      
      // 如果名称变了
      if (formName.value.trim() !== editingApiKey.value.name) {
        patchPayload.name = formName.value.trim()
      }
      
      // 只有有变化时才发请求
      if (Object.keys(patchPayload).length > 1) {
        await apiClient.patch('/api-keys', patchPayload)
      }
      
      toast({ title: 'API 密钥已更新' })
    } else {
      // 添加新密钥
      const keyToAdd = trimmedKey || crypto.randomUUID()
      await apiClient.post('/api-keys', {
        'api-key': keyToAdd,
        name: formName.value.trim() || undefined
      })
      
      toast({ title: 'API 密钥添加成功' })
    }
    closeDialog()
    await fetchKeys()
  } catch (err: unknown) {
    const error = err as { message?: string }
    toast({ title: error?.message || '操作失败', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

function confirmDelete(apiKey: ApiKeyInfo) {
  deleteTargetKey.value = apiKey
  showDeleteConfirm.value = true
}

function cancelDelete() {
  showDeleteConfirm.value = false
  deleteTargetKey.value = null
}

async function executeDelete() {
  if (!deleteTargetKey.value) return
  
  const id = deleteTargetKey.value.id
  deletingId.value = id
  showDeleteConfirm.value = false

  try {
    await apiClient.delete(`/api-keys?id=${encodeURIComponent(id)}`)
    toast({ title: 'API 密钥已删除' })
    await fetchKeys()
  } catch {
    toast({ title: '删除 API 密钥失败', variant: 'destructive' })
  } finally {
    deletingId.value = null
    deleteTargetKey.value = null
  }
}

onMounted(fetchKeys)
</script>
