<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs, inject, watch } from 'vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useProxyEgressStore } from '@/stores/proxyEgress'
import { useClipboard } from '@/composables/useClipboard'
import { useToast } from '@/composables/useToast'
import { Copy, Zap } from 'lucide-vue-next'
import { proxyEgressSchedulerKey } from '@/composables/proxyEgressContext'

interface Props {
  targetId?: string | null
  proxyConfigured?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  targetId: null,
  proxyConfigured: false
})

const attrs = useAttrs()
const forwardedAttrs = computed(() => {
  const raw = attrs as Record<string, unknown>
  // Prevent double-applying class/style/onClick. We control click for manual probe.
  const { class: _class, style: _style, onClick: _onClick, ...rest } = raw
  return rest
})
const scheduler = inject(proxyEgressSchedulerKey, null)
const store = useProxyEgressStore()

const { copy } = useClipboard()
const { toast } = useToast()

const degradedThresholdMs = 3000
const twemojiBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg'

const flagLoadError = ref(false)

const state = computed(() => {
  const id = props.targetId?.trim()
  if (!id) return null
  return store.getState(id)
})

const record = computed(() => state.value?.record || null)
const hasProbeError = computed(() => Boolean(state.value?.last_error))
const isChecking = computed(() => Boolean(state.value?.in_flight))

const countryCode = computed(() => {
  const loc = record.value?.loc
  if (typeof loc !== 'string') return null
  const v = loc.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(v) ? v : null
})

const colo = computed(() => {
  const v = record.value?.colo
  return typeof v === 'string' && v.trim() ? v.trim().toUpperCase() : null
})

const ip = computed(() => {
  const v = record.value?.ip
  return typeof v === 'string' && v.trim() ? v.trim() : null
})

const rttMs = computed(() => {
  const v = record.value?.rtt_ms
  return typeof v === 'number' && Number.isFinite(v) ? v : null
})

const isDegraded = computed(() => {
  const v = rttMs.value
  if (v === null) return false
  return v >= degradedThresholdMs
})

const badgeVariant = computed(() => {
  if (!props.proxyConfigured) return 'none'
  if (isChecking.value) return 'checking'
  if (hasProbeError.value) return 'down'
  if (record.value && countryCode.value) return isDegraded.value ? 'degraded' : 'ok'
  return 'unknown'
})

const badgeClass = computed(() => {
  const base = 'pointer-events-none absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-semibold bg-background shadow-sm'
  if (badgeVariant.value === 'ok') return cn(base, 'border-emerald-500/40')
  if (badgeVariant.value === 'degraded') return cn(base, 'border-amber-500/60')
  if (badgeVariant.value === 'down') return cn(base, 'border-red-500/70')
  if (badgeVariant.value === 'checking') return cn(base, 'border-primary/40')
  if (badgeVariant.value === 'unknown') return cn(base, 'border-border/60')
  return cn(base, 'hidden')
})

const flagUrl = computed(() => {
  const code = countryCode.value
  if (!code) return null
  const points = code
    .split('')
    .map((ch) => (0x1f1e6 + (ch.charCodeAt(0) - 65)).toString(16))
    .join('-')
  return `${twemojiBaseUrl}/${points}.svg`
})

const buttonClass = computed(() => {
  const clickable = props.proxyConfigured && Boolean(props.targetId?.trim())
  return cn(
    'relative p-0 border-0 appearance-none',
    clickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    (attrs as any).class
  )
})

const manualCooldownText = computed(() => {
  const id = props.targetId?.trim()
  if (!id) return '手动刷新：30s 内仅可点击一次'
  const remaining = store.getManualCooldownRemainingMs(id)
  if (remaining <= 0) return '手动刷新：30s 内仅可点击一次'
  return `手动刷新：冷却中（还剩 ${Math.ceil(remaining / 1000)}s）`
})

function formatLatency(ms: number | null): string {
  if (ms === null) return '--'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

async function onCopyIp() {
  const value = ip.value
  if (!value) return
  const ok = await copy(value)
  if (ok) toast({ title: '已复制出口 IP' })
  else toast({ title: '复制失败', variant: 'destructive' })
}

function onManualProbe() {
  if (!props.proxyConfigured) return
  const id = props.targetId?.trim()
  if (!id) return
  store.probeManual(id)
}

const registeredId = ref<string | null>(null)

function syncRegistration() {
  if (!scheduler) return

  const id = props.targetId?.trim() || null
  const shouldRegister = Boolean(props.proxyConfigured && id)

  if (registeredId.value && registeredId.value !== id) {
    scheduler.unregister(registeredId.value)
    registeredId.value = null
  }

  if (shouldRegister && id && registeredId.value !== id) {
    scheduler.register(id)
    registeredId.value = id
  }

  if (!shouldRegister && registeredId.value) {
    scheduler.unregister(registeredId.value)
    registeredId.value = null
  }
}

onMounted(syncRegistration)
watch(() => [props.proxyConfigured, props.targetId], syncRegistration)

onUnmounted(() => {
  if (!scheduler) return
  if (!registeredId.value) return
  scheduler.unregister(registeredId.value)
  registeredId.value = null
})
</script>

<template>
  <TooltipProvider v-if="proxyConfigured">
    <Tooltip :disable-hoverable-content="false">
      <TooltipTrigger asChild>
        <button v-bind="forwardedAttrs" type="button" :class="buttonClass" :style="(attrs as any).style" @click="onManualProbe">
          <slot />

          <span v-if="badgeVariant !== 'none'" :class="badgeClass">
            <span v-if="badgeVariant === 'checking'" class="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />

            <template v-else-if="badgeVariant === 'ok' || badgeVariant === 'degraded' || badgeVariant === 'down'">
              <img
                v-if="flagUrl && !flagLoadError"
                :src="flagUrl"
                class="h-3 w-3"
                :class="badgeVariant === 'down' ? 'opacity-60 grayscale' : ''"
                alt=""
                @error="flagLoadError = true"
              />
              <span v-else class="leading-none" :class="badgeVariant === 'down' ? 'text-red-600' : ''">
                {{ countryCode || '??' }}
              </span>
            </template>

            <Zap v-else class="h-3 w-3" :class="badgeVariant === 'down' ? 'text-red-600' : ''" />
          </span>
        </button>
      </TooltipTrigger>

      <TooltipContent class="min-w-[200px] pr-2">
        <div class="space-y-1">
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs font-medium text-foreground">代理出口</div>
            <button
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
              :disabled="!ip"
              title="复制出口 IP"
              @click="onCopyIp"
            >
              <Copy class="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <div class="text-xs text-muted-foreground">
            出口IP: <span class="font-mono text-foreground">{{ ip || '--' }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            位置: <span class="font-mono text-foreground">{{ countryCode || '--' }}</span>
            <span v-if="colo" class="text-muted-foreground"> · </span>
            <span v-if="colo" class="font-mono text-foreground">{{ colo }}</span>
          </div>
          <div class="text-xs text-muted-foreground">
            延迟: <span class="font-mono text-foreground">{{ formatLatency(rttMs) }}</span>
            <span v-if="hasProbeError" class="text-red-600">（失败）</span>
            <span v-else-if="rttMs !== null && rttMs >= degradedThresholdMs" class="text-amber-600">（慢）</span>
          </div>

          <div class="pt-1 text-[10px] text-muted-foreground">
            {{ manualCooldownText }}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <div v-else v-bind="forwardedAttrs" :class="buttonClass" :style="(attrs as any).style">
    <slot />
  </div>
</template>
