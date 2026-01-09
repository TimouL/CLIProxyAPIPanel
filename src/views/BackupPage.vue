<template>
  <PageContainer>
    <PageHeader
      title="备份与恢复"
      description="创建备份和恢复配置"
    />

    <!-- Create Backup -->
    <Section title="创建备份" class="mb-8">
      <CardSection>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-foreground">下载当前配置</h3>
            <p class="text-sm text-muted-foreground mt-1">
              导出所有设置、API 密钥和提供商配置
            </p>
          </div>
          <Button @click="createBackup" :disabled="creatingBackup">
            <Loader2 v-if="creatingBackup" class="w-4 h-4 mr-2 animate-spin" />
            <Download v-else class="w-4 h-4 mr-2" />
            创建备份
          </Button>
        </div>
      </CardSection>
    </Section>

    <!-- Restore Backup -->
    <Section title="恢复备份" class="mb-8">
      <CardSection>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-foreground">上传备份文件</h3>
            <p class="text-sm text-muted-foreground mt-1">
              从之前的备份恢复设置
            </p>
          </div>
          <div>
            <input
              ref="restoreInput"
              type="file"
              accept=".json,.yaml,.yml"
              class="hidden"
              @change="handleRestore"
            />
            <Button variant="outline" @click="restoreInput?.click()" :disabled="restoring">
              <Loader2 v-if="restoring" class="w-4 h-4 mr-2 animate-spin" />
              <Upload v-else class="w-4 h-4 mr-2" />
              恢复备份
            </Button>
          </div>
        </div>
      </CardSection>
    </Section>

    <!-- Backup History -->
    <Section title="最近备份">
      <div v-if="loading" class="flex justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>

      <div v-else-if="backups.length === 0" class="text-center py-8 text-muted-foreground">
        暂无备份历史
      </div>

      <div v-else class="space-y-2">
        <CardSection
          v-for="backup in backups"
          :key="backup.name"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Archive class="w-5 h-5 text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm text-foreground truncate">
                {{ backup.name }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ formatDate(backup.date) }}
                <span v-if="backup.size" class="ml-2">{{ formatSize(backup.size) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm" @click="downloadBackup(backup.name)">
              <Download class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" class="text-red-500" @click="deleteBackup(backup.name)">
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </CardSection>
      </div>
    </Section>

    <!-- Danger Zone (Hidden - reset endpoint not available in backend) -->
    <!-- 
    <Section title="危险区域">
      <CardSection class="border-red-200 dark:border-red-800/30">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-red-600 dark:text-red-400">重置所有配置</h3>
            <p class="text-sm text-muted-foreground mt-1">
              这将把所有设置重置为出厂默认值。此操作无法撤销。
            </p>
          </div>
          <Button variant="destructive" @click="showResetConfirm = true">
            <AlertTriangle class="w-4 h-4 mr-2" />
            全部重置
          </Button>
        </div>
      </CardSection>
    </Section>
    -->

    <!-- Reset Confirmation Dialog (Hidden - reset endpoint not available) -->
    <!--
    <Dialog v-model:open="showResetConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置配置?</DialogTitle>
          <DialogDescription>
            这将把所有设置重置为默认值。所有 API 密钥、提供商配置和自定义设置都将丢失。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showResetConfirm = false">取消</Button>
          <Button variant="destructive" @click="resetAll">
            是的，重置所有
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    -->
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Section from '@/components/layout/Section.vue'
import Button from '@/components/ui/button.vue'
import {
  Download,
  Upload,
  Archive,
  Trash2,
  Loader2,
} from 'lucide-vue-next'

interface Backup {
  name: string
  date: string
  size?: number
  content?: {
    env?: boolean
    config?: boolean
    auths?: boolean
  }
}

interface BackupListResponse {
  backups: Backup[]
  backupPath: string
}

const { toast } = useToast()

const loading = ref(true)
const creatingBackup = ref(false)
const restoring = ref(false)
const backups = ref<Backup[]>([])
const restoreInput = ref<HTMLInputElement>()

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchBackups() {
  loading.value = true
  try {
    const data = await apiClient.get<BackupListResponse>('/backups')
    backups.value = data?.backups || []
  } catch {
    backups.value = []
  } finally {
    loading.value = false
  }
}

async function createBackup() {
  creatingBackup.value = true
  try {
    // POST to /backups to create a new backup
    await apiClient.post('/backups', {
      content: { config: true, auths: true }
    })
    toast({ title: '备份已创建' })
    await fetchBackups()
  } catch {
    toast({ title: '创建备份失败', variant: 'destructive' })
  } finally {
    creatingBackup.value = false
  }
}

async function handleRestore(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  restoring.value = true
  try {
    // Upload and restore using FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('authsMode', 'overwrite')
    await apiClient.postForm('/backups/upload', formData)
    toast({ title: '备份恢复成功' })
    await fetchBackups()
  } catch {
    toast({ title: '恢复备份失败', variant: 'destructive' })
  } finally {
    restoring.value = false
    input.value = ''
  }
}

async function downloadBackup(name: string) {
  try {
    // Download backup file
    const response = await apiClient.getRaw(`/backups/${encodeURIComponent(name)}/download`)
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.endsWith('.zip') ? name : `${name}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    toast({ title: '下载备份失败', variant: 'destructive' })
  }
}

async function deleteBackup(name: string) {
  try {
    await apiClient.delete(`/backups/${encodeURIComponent(name)}`)
    toast({ title: '备份已删除' })
    await fetchBackups()
  } catch {
    toast({ title: '删除备份失败', variant: 'destructive' })
  }
}

// Reset functionality is hidden - backend doesn't have /reset endpoint

onMounted(fetchBackups)
</script>
