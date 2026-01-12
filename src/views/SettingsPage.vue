<template>
  <PageContainer>
    <!-- 直接显示内容，去掉页面标题 -->

    <!-- Connection Settings -->
    <Section title="连接设置" class="mb-8">
      <div class="space-y-4">
        <CardSection>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">服务器地址</label>
              <Input v-model="settings.apiBase" placeholder="http://localhost:8080" />
              <p class="text-xs text-muted-foreground mt-1">当前: {{ authStore.apiBase }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">管理密钥</label>
              <div class="relative">
                <Input
                  v-model="settings.managementKey"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="输入新的管理密钥"
                  class="pr-10"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  @click="showKey = !showKey"
                >
                  <EyeOff v-if="showKey" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="testConnection" :disabled="testing">
                <Loader2 v-if="testing" class="w-4 h-4 mr-2 animate-spin" />
                测试连接
              </Button>
              <Button @click="updateConnection" :disabled="!hasConnectionChanges">
                更新连接
              </Button>
            </div>
          </div>
        </CardSection>
      </div>
    </Section>

    <!-- Appearance -->
    <Section title="外观" class="mb-8">
      <CardSection>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-foreground">主题</h3>
            <p class="text-sm text-muted-foreground">选择您喜欢的配色方案</p>
          </div>
          <div class="flex items-center gap-2">
            <Button
              :variant="themeMode === 'light' ? 'default' : 'outline'"
              size="sm"
              @click="setTheme('light')"
            >
              <SunMedium class="w-4 h-4 mr-2" />
              浅色
            </Button>
            <Button
              :variant="themeMode === 'dark' ? 'default' : 'outline'"
              size="sm"
              @click="setTheme('dark')"
            >
              <Moon class="w-4 h-4 mr-2" />
              深色
            </Button>
            <Button
              :variant="themeMode === 'system' ? 'default' : 'outline'"
              size="sm"
              @click="setTheme('system')"
            >
              <Monitor class="w-4 h-4 mr-2" />
              系统
            </Button>
          </div>
        </div>
      </CardSection>
    </Section>

    <!-- Advanced Settings -->
    <Section title="高级配置" class="mb-8">
      <div class="space-y-4">
        <CardSection>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-foreground">请求超时</h3>
              <p class="text-sm text-muted-foreground">等待 API 响应的最长时间</p>
            </div>
            <div class="w-32">
              <Input
                v-model.number="settings.timeout"
                type="number"
                min="5000"
                max="120000"
                step="1000"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">当前: {{ settings.timeout }}ms</p>
        </CardSection>

        <!-- 系统配置开关 -->
        <CardSection>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">调试模式</h3>
                <p class="text-sm text-muted-foreground">启用详细的调试日志输出</p>
              </div>
              <Switch
                :checked="systemConfig.debug"
                :disabled="!authStore.isConnected || loadingConfig"
                @update:checked="updateSystemConfig('debug', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">使用统计</h3>
                <p class="text-sm text-muted-foreground">收集匿名使用统计信息</p>
              </div>
              <Switch
                :checked="systemConfig.usageStatisticsEnabled"
                :disabled="!authStore.isConnected || loadingConfig"
                @update:checked="updateSystemConfig('usageStatisticsEnabled', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">日志记录到文件</h3>
                <p class="text-sm text-muted-foreground">将日志保存到本地文件</p>
              </div>
              <Switch
                :checked="systemConfig.loggingToFile"
                :disabled="!authStore.isConnected || loadingConfig"
                @update:checked="updateSystemConfig('loggingToFile', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-foreground">WebSocket 认证</h3>
                <p class="text-sm text-muted-foreground">启用 WebSocket 连接认证</p>
              </div>
              <Switch
                :checked="systemConfig.wsAuth"
                :disabled="!authStore.isConnected || loadingConfig"
                @update:checked="updateSystemConfig('wsAuth', $event)"
              />
            </div>
          </div>
        </CardSection>

        <!-- 网络配置 -->
        <CardSection>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">代理服务器</label>
              <div class="flex gap-2">
                <Input
                  v-model="networkConfig.proxyUrl"
                  placeholder="http://proxy.example.com:8080"
                  :disabled="!authStore.isConnected"
                  class="flex-1"
                />
                <Button
                  variant="outline"
                  @click="updateNetworkConfig('proxyUrl', networkConfig.proxyUrl)"
                  :disabled="!authStore.isConnected || updatingNetwork"
                >
                  <Loader2 v-if="updatingNetwork" class="w-4 h-4 mr-2 animate-spin" />
                  更新
                </Button>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                当前: {{ systemConfig.proxyUrl || '未设置' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">请求重试次数</label>
              <div class="flex gap-2">
                <Input
                  v-model.number="networkConfig.requestRetry"
                  type="number"
                  min="0"
                  max="10"
                  :disabled="!authStore.isConnected"
                  class="w-32"
                />
                <Button
                  variant="outline"
                  @click="updateNetworkConfig('requestRetry', networkConfig.requestRetry)"
                  :disabled="!authStore.isConnected || updatingNetwork"
                >
                  <Loader2 v-if="updatingNetwork" class="w-4 h-4 mr-2 animate-spin" />
                  更新
                </Button>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                当前: {{ systemConfig.requestRetry ?? 0 }} 次
              </p>
            </div>
          </div>
        </CardSection>
      </div>
    </Section>

    <!-- About -->
    <Section title="关于">
      <CardSection>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted-foreground">客户端版本</span>
            <div class="flex items-center gap-2">
              <span class="text-foreground font-mono">{{ clientVersion }}</span>
              <div v-if="checkingUpdate" class="flex items-center text-muted-foreground">
                <Loader2 class="w-3 h-3 animate-spin mr-1" />
                <span class="text-xs">检查更新中...</span>
              </div>
              <div v-else-if="hasUpdate" class="flex items-center gap-2">
                <span class="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  有新版本 {{ latestVersion }}
                </span>
                <Button 
                  size="sm" 
                  @click="updateWebUI"
                  :disabled="updating"
                  class="text-xs"
                >
                  <Loader2 v-if="updating" class="w-3 h-3 animate-spin mr-1" />
                  {{ updating ? '更新中...' : '立即更新' }}
                </Button>
              </div>
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">服务器版本</span>
            <span class="text-foreground font-mono">{{ authStore.serverVersion || '未知' }}</span>
          </div>
        </div>
      </CardSection>
    </Section>

    <!-- Disconnect Button -->
    <div class="mt-8">
      <Button variant="destructive" class="w-full" @click="handleDisconnect">
        <LogOut class="w-4 h-4 mr-2" />
        断开连接
      </Button>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { useDarkMode } from '@/composables/useDarkMode'
import { useToast } from '@/composables/useToast'
import { configApi } from '@/api/config'
import { apiClient } from '@/api/client'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import CardSection from '@/components/layout/CardSection.vue'
import Section from '@/components/layout/Section.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Switch from '@/components/ui/switch.vue'
import {
  Eye,
  EyeOff,
  SunMedium,
  Moon,
  Monitor,
  LogOut,
  Loader2,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()
const { themeMode, setThemeMode } = useDarkMode()
const { toast } = useToast()

const showKey = ref(false)
const testing = ref(false)
const checkingUpdate = ref(false)
const updating = ref(false)
const loadingConfig = ref(false)
const updatingNetwork = ref(false)
const latestVersion = ref<string | null>(null)
const hasUpdate = ref(false)

// 获取客户端版本
const clientVersion = __APP_VERSION__ || '未知'

const settings = reactive({
  apiBase: authStore.apiBase,
  managementKey: '',
  timeout: 30000,
})

// 系统配置状态
const systemConfig = reactive({
  debug: false,
  usageStatisticsEnabled: false,
  loggingToFile: false,
  wsAuth: false,
  proxyUrl: '',
  requestRetry: 0,
})

// 网络配置临时状态
const networkConfig = reactive({
  proxyUrl: '',
  requestRetry: 0,
})

const hasConnectionChanges = computed(() => {
  return settings.apiBase !== authStore.apiBase || settings.managementKey.trim() !== ''
})

// 加载系统配置
const loadSystemConfig = async () => {
  if (!authStore.isConnected) return
  
  loadingConfig.value = true
  try {
    const config = await configStore.fetchConfig()
    if (config) {
      systemConfig.debug = config.debug || false
      systemConfig.usageStatisticsEnabled = config.usageStatisticsEnabled || false
      systemConfig.loggingToFile = config.loggingToFile || false
      systemConfig.wsAuth = config.wsAuth || false
      systemConfig.proxyUrl = config.proxyUrl || ''
      systemConfig.requestRetry = config.requestRetry || 0
      
      // 更新网络配置临时状态
      networkConfig.proxyUrl = config.proxyUrl || ''
      networkConfig.requestRetry = config.requestRetry || 0
    }
  } catch (error) {
    console.warn('Failed to load system config:', error)
  } finally {
    loadingConfig.value = false
  }
}

// 更新系统配置
const updateSystemConfig = async (key: string, value: any) => {
  if (!authStore.isConnected) return
  
  try {
    switch (key) {
      case 'debug':
        await configApi.updateDebug(value)
        systemConfig.debug = value
        break
      case 'usageStatisticsEnabled':
        await configApi.updateUsageStatistics(value)
        systemConfig.usageStatisticsEnabled = value
        break
      case 'loggingToFile':
        await configApi.updateLoggingToFile(value)
        systemConfig.loggingToFile = value
        break
      case 'wsAuth':
        await configApi.updateWsAuth(value)
        systemConfig.wsAuth = value
        break
    }
    
    // 清除配置缓存
    configStore.clearCache()
    
    toast({ title: '配置已更新' })
  } catch (error) {
    toast({ 
      title: '更新失败', 
      description: (error as Error).message,
      variant: 'destructive' 
    })
  }
}

// 更新网络配置
const updateNetworkConfig = async (key: string, value: any) => {
  if (!authStore.isConnected) return
  
  updatingNetwork.value = true
  try {
    switch (key) {
      case 'proxyUrl':
        if (value) {
          await configApi.updateProxyUrl(value)
        } else {
          await configApi.clearProxyUrl()
        }
        systemConfig.proxyUrl = value
        break
      case 'requestRetry':
        await configApi.updateRequestRetry(Number(value) || 0)
        systemConfig.requestRetry = Number(value) || 0
        break
    }
    
    // 清除配置缓存
    configStore.clearCache()
    
    toast({ title: '网络配置已更新' })
  } catch (error) {
    toast({ 
      title: '更新失败', 
      description: (error as Error).message,
      variant: 'destructive' 
    })
  } finally {
    updatingNetwork.value = false
  }
}

// 版本比较函数
function compareVersions(latest: string, current: string): number {
  const parseVersion = (version: string) => {
    return version.replace(/^v/, '').split('.').map(num => parseInt(num, 10) || 0)
  }
  
  const latestParts = parseVersion(latest)
  const currentParts = parseVersion(current)
  const maxLength = Math.max(latestParts.length, currentParts.length)
  
  for (let i = 0; i < maxLength; i++) {
    const latestPart = latestParts[i] || 0
    const currentPart = currentParts[i] || 0
    
    if (latestPart > currentPart) return 1
    if (latestPart < currentPart) return -1
  }
  
  return 0
}

// 检查更新
async function checkForUpdates() {
  if (checkingUpdate.value) return
  
  checkingUpdate.value = true
  try {
    const response = await fetch('https://api.github.com/repos/AoaoMH/CLIProxyAPIPanel/releases/latest')
    if (!response.ok) throw new Error('Failed to fetch latest release')
    
    const data = await response.json()
    latestVersion.value = data.tag_name
    
    if (latestVersion.value && compareVersions(latestVersion.value, clientVersion) > 0) {
      hasUpdate.value = true
      toast({ 
        title: '发现新版本', 
        description: `最新版本 ${latestVersion.value} 可用，当前版本 ${clientVersion}` 
      })
    }
  } catch (error) {
    console.warn('Failed to check for updates:', error)
  } finally {
    checkingUpdate.value = false
  }
}

// 更新 WebUI
async function updateWebUI() {
  if (!latestVersion.value || updating.value) return
  
  updating.value = true
  try {
    await apiClient.post('/webui/update', { version: latestVersion.value })
    
    // 显示成功提示
    toast({
      title: '更新完成',
      description: `WebUI 已更新到版本 ${latestVersion.value}`
    })
    
    // 询问是否刷新
    setTimeout(() => {
      if (confirm('WebUI 更新完成，是否刷新页面以应用更新？')) {
        window.location.reload()
      }
    }, 1000)
    
    hasUpdate.value = false
  } catch (error) {
    toast({ 
      title: '更新失败', 
      description: (error as Error).message,
      variant: 'destructive' 
    })
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  // 进入页面时检查更新和加载配置
  checkForUpdates()
  loadSystemConfig()
})

function setTheme(mode: 'light' | 'dark' | 'system') {
  setThemeMode(mode)
}

async function testConnection() {
  testing.value = true
  try {
    const baseToUse = settings.apiBase || authStore.apiBase
    const keyToUse = settings.managementKey || authStore.managementKey

    apiClient.setConfig({
      apiBase: baseToUse,
      managementKey: keyToUse,
    })

    await apiClient.get('/config')
    toast({ title: '连接成功' })
  } catch {
    toast({ title: '连接失败', variant: 'destructive' })
    // Restore original config
    apiClient.setConfig({
      apiBase: authStore.apiBase,
      managementKey: authStore.managementKey,
    })
  } finally {
    testing.value = false
  }
}

async function updateConnection() {
  try {
    const success = await authStore.connect({
      apiBase: settings.apiBase || authStore.apiBase,
      managementKey: settings.managementKey || authStore.managementKey,
    })

    if (success) {
      toast({ title: '连接已更新' })
      settings.managementKey = ''
      // 重新加载系统配置
      loadSystemConfig()
    } else {
      toast({ title: '更新连接失败', variant: 'destructive' })
    }
  } catch {
    toast({ title: '更新连接失败', variant: 'destructive' })
  }
}

function handleDisconnect() {
  authStore.disconnect()
  router.push('/')
}
</script>
