<template>
  <PageContainer>
    <PageHeader
      title="认证文件"
      description="管理用于服务认证的 OAuth 凭证文件"
    >
      <template #actions>
        <Button @click="triggerUpload">
          <Upload class="w-4 h-4 mr-2" />
          上传文件
        </Button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileUpload"
        />
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Empty State -->
    <CardSection v-else-if="files.length === 0" class="text-center py-12">
      <FileText class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">暂无认证文件</h3>
      <p class="text-muted-foreground mb-4">上传 OAuth 凭证 JSON 文件</p>
      <Button @click="triggerUpload">
        <Upload class="w-4 h-4 mr-2" />
        上传文件
      </Button>
    </CardSection>

    <!-- Files List -->
    <div v-else class="space-y-3">
      <CardSection
        v-for="file in files"
        :key="file.name"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <FileJson class="w-5 h-5 text-blue-500" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-sm text-foreground truncate">{{ file.name }}</div>
            <div class="text-xs text-muted-foreground mt-1">
              {{ formatFileSize(file.size) }}
              <span v-if="file.modTime" class="ml-2">
                修改时间: {{ formatDate(file.modTime) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="downloadFile(file.name)">
            <Download class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" class="text-red-500 hover:text-red-600" @click="deleteFile(file.name)">
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </CardSection>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClient } from '@/api/client'
import { useToast } from '@/composables/useToast'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Button from '@/components/ui/button.vue'
import {
  FileText,
  FileJson,
  Upload,
  Download,
  Trash2,
  Loader2,
} from 'lucide-vue-next'

interface AuthFile {
  name: string
  size?: number
  modTime?: string
}

const { toast } = useToast()

const loading = ref(true)
const files = ref<AuthFile[]>([])
const fileInput = ref<HTMLInputElement>()

function formatFileSize(bytes?: number): string {
  if (!bytes) return '未知大小'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function fetchFiles() {
  loading.value = true
  try {
    const data = await apiClient.get<{ files: AuthFile[] }>('/auth-files')
    files.value = data.files || []
  } catch {
    toast({ title: '加载认证文件失败', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    await apiClient.postForm('/auth-files', formData)
    toast({ title: '文件上传成功' })
    await fetchFiles()
  } catch {
    toast({ title: '上传文件失败', variant: 'destructive' })
  } finally {
    input.value = ''
  }
}

async function downloadFile(name: string) {
  try {
    const response = await apiClient.getRaw(`/auth-files/download?name=${encodeURIComponent(name)}`)
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    toast({ title: '下载文件失败', variant: 'destructive' })
  }
}

async function deleteFile(name: string) {
  try {
    await apiClient.delete(`/auth-files?name=${encodeURIComponent(name)}`)
    toast({ title: '文件已删除' })
    await fetchFiles()
  } catch {
    toast({ title: '删除文件失败', variant: 'destructive' })
  }
}

onMounted(fetchFiles)
</script>
