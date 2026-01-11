<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#faf9f5] dark:bg-[#191714] p-4">
    <!-- Paper texture overlay -->
    <div
      class="absolute inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-multiply"
      :style="{ backgroundImage: `url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E&quot;)` }"
    />

      <!-- Card -->
      <div 
        class="bg-card dark:bg-[#1e1c19] rounded-3xl shadow-2xl border border-border/60 p-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-700 ease-out relative overflow-hidden"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-tr-full pointer-events-none"></div>

        <!-- Header -->
        <div class="text-center mb-10 relative z-10">
          <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Server class="w-10 h-10 text-primary" />
          </div>
          <h1 class="text-3xl font-serif font-medium text-foreground mb-3 tracking-tight">CLI Proxy API</h1>
          <p class="text-base text-muted-foreground font-light">连接到管理服务器</p>
        </div>

        <!-- Connection Info Box -->
        <div class="mb-8 p-5 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm relative overflow-hidden group hover:border-primary/20 transition-colors">
          <div class="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
          <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 pl-2">当前连接</div>
          <div class="text-sm font-mono text-foreground truncate select-all pl-2">{{ displayApiBase }}</div>
          <div class="text-xs text-muted-foreground mt-2 pl-2 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            从当前 URL 自动检测
          </div>
        </div>

        <!-- Custom Connection Toggle -->
        <div class="mb-6">
          <label class="flex items-center gap-3 cursor-pointer group select-none">
            <div class="relative">
              <input
                type="checkbox"
                v-model="showCustomBase"
                class="sr-only peer"
              />
              <div class="w-10 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">使用自定义服务器地址</span>
          </label>
        </div>

        <!-- Custom API Base -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2 h-0 mb-0"
          enter-to-class="opacity-100 translate-y-0 h-auto mb-6"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 h-auto mb-6"
          leave-to-class="opacity-0 -translate-y-2 h-0 mb-0"
        >
          <div v-if="showCustomBase" class="mb-6 overflow-hidden">
            <label class="block text-sm font-medium text-foreground mb-2 ml-1">服务器地址</label>
            <Input
              v-model="apiBase"
              placeholder="http://localhost:8080"
              class="w-full h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 bg-background/50"
            />
            <p class="text-xs text-muted-foreground mt-2 ml-1">CLI Proxy API 服务器完整 URL</p>
          </div>
        </transition>

        <!-- Management Key -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-foreground mb-2 ml-1">管理密钥</label>
          <div class="relative group">
            <Input
              v-model="managementKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="输入管理密钥"
              class="w-full pr-12 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 bg-background/50 font-mono text-sm"
              @keyup.enter="handleConnect"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              @click="showKey = !showKey"
            >
              <EyeOff v-if="showKey" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Remember Checkbox -->
        <div class="mb-8">
          <label class="flex items-center gap-3 cursor-pointer group select-none">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                v-model="rememberKey"
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-input bg-background transition-all hover:border-primary checked:border-primary checked:bg-primary"
              />
              <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span class="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">记住凭证</span>
          </label>
        </div>

        <!-- Connect Button -->
        <Button
          class="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          :disabled="!managementKey.trim() || isConnecting"
          @click="handleConnect"
        >
          <Loader2 v-if="isConnecting" class="w-5 h-5 mr-2 animate-spin" />
          {{ isConnecting ? '正在连接...' : '连接服务器' }}
        </Button>

        <!-- Error Message -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform translate-y-2"
          enter-to-class="opacity-100 transform translate-y-0"
        >
          <div
            v-if="error"
            class="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 shadow-sm"
          >
             <div class="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-red-500 shadow-red-500/50 shadow-sm animate-pulse"></div>
             {{ error }}
          </div>
        </transition>

        <!-- Auto-connecting Indicator -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform scale-95"
          enter-to-class="opacity-100 transform scale-100"
        >
          <div
            v-if="autoConnecting"
            class="mt-6 p-6 rounded-2xl bg-muted/30 border border-border/40 text-center backdrop-blur-md shadow-inner"
          >
            <Loader2 class="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <div class="text-sm font-medium text-foreground">正在恢复上次会话...</div>
          </div>
        </transition>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <button
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          @click="toggleDarkMode"
        >
          <SunMoon v-if="themeMode === 'system'" class="w-4 h-4 inline mr-1" />
          <SunMedium v-else-if="themeMode === 'light'" class="w-4 h-4 inline mr-1" />
          <Moon v-else class="w-4 h-4 inline mr-1" />
          {{ themeMode === 'system' ? '跟随系统' : themeMode === 'dark' ? '深色模式' : '浅色模式' }}
        </button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import {
  Server,
  Eye,
  EyeOff,
  Loader2,
  SunMoon,
  SunMedium,
  Moon,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { themeMode, toggleDarkMode } = useDarkMode()

const apiBase = ref('')
const managementKey = ref('')
const showCustomBase = ref(false)
const showKey = ref(false)
const rememberKey = ref(true)
const isConnecting = ref(false)
const autoConnecting = ref(false)
const error = ref('')

// Detect API base from current URL
const detectedApiBase = computed(() => {
  const { protocol, host } = window.location
  return `${protocol}//${host}`
})

const displayApiBase = computed(() => {
  return showCustomBase.value && apiBase.value ? apiBase.value : detectedApiBase.value
})

onMounted(async () => {
  // Initialize auth store
  authStore.init()

  // Try auto-connect if we have stored credentials
  if (authStore.hasCredentials) {
    autoConnecting.value = true
    const success = await authStore.autoConnect()
    autoConnecting.value = false

    if (success) {
      const redirect = (route.query.redirect as string) || '/app/dashboard'
      router.push(redirect)
    }
  }
})

async function handleConnect() {
  if (!managementKey.value.trim()) {
    error.value = '请输入管理密钥'
    return
  }

  isConnecting.value = true
  error.value = ''

  try {
    const baseToUse = showCustomBase.value && apiBase.value ? apiBase.value : detectedApiBase.value

    const success = await authStore.connect({
      apiBase: baseToUse,
      managementKey: managementKey.value.trim()
    })

    if (success) {
      const redirect = (route.query.redirect as string) || '/app/dashboard'
      router.push(redirect)
    } else {
      error.value = authStore.connectionError || '连接失败'
    }
  } catch (err) {
    error.value = (err as Error).message || '连接失败'
  } finally {
    isConnecting.value = false
  }
}
</script>
