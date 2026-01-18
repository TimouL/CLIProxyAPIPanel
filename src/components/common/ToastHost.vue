<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toastItem in toasts"
          :key="toastItem.id"
          class="pointer-events-auto"
        >
          <div :class="toastClasses(toastItem)">
            <div class="flex items-start gap-3">
              <component :is="toastIcon(toastItem)" :class="toastIconClasses(toastItem)" class="w-4 h-4 mt-0.5 shrink-0" />
              <div class="min-w-0 flex-1">
                <p v-if="toastItem.title" class="text-sm font-medium text-foreground">
                  {{ toastItem.title }}
                </p>
                <p v-if="toastItem.message" class="text-sm text-muted-foreground break-words">
                  {{ toastItem.message }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                aria-label="Close notification"
                @click="removeToast(toastItem.id)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from 'lucide-vue-next'
import { useToast, type Toast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

type ToastKind = 'default' | 'success' | 'info' | 'warning' | 'error'

function normalizeKind(toastItem: Toast): ToastKind {
  const variant = toastItem.variant ?? 'default'
  if (variant === 'destructive' || variant === 'error') return 'error'
  if (variant === 'success') return 'success'
  if (variant === 'warning') return 'warning'
  if (variant === 'info') return 'info'
  return 'default'
}

function toastIcon(toastItem: Toast): Component {
  switch (normalizeKind(toastItem)) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'info':
      return Info
    default:
      return Info
  }
}

function toastIconClasses(toastItem: Toast): string {
  switch (normalizeKind(toastItem)) {
    case 'success':
      return 'text-emerald-600'
    case 'warning':
      return 'text-amber-600'
    case 'error':
      return 'text-red-600'
    case 'info':
      return 'text-sky-600'
    default:
      return 'text-muted-foreground'
  }
}

function toastClasses(toastItem: Toast): string {
  const base =
    'rounded-lg border bg-card px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5'

  switch (normalizeKind(toastItem)) {
    case 'success':
      return `${base} border-l-4 border-l-emerald-500`
    case 'warning':
      return `${base} border-l-4 border-l-amber-500`
    case 'error':
      return `${base} border-l-4 border-l-red-500`
    case 'info':
      return `${base} border-l-4 border-l-sky-500`
    default:
      return `${base} border-l-4 border-l-muted-foreground/30`
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate3d(8px, -8px, 0);
}

.toast-move {
  transition: transform 160ms ease;
}
</style>

