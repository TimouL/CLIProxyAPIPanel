import { ref } from 'vue'
import { TOAST_CONFIG } from '@/config/constants'

export type ToastVariant = 'default' | 'destructive' | 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  message?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function showToast(options: Omit<Toast, 'id'>) {
    const toastItem: Toast = {
      id: Date.now().toString(),
      variant: 'default',
      duration: 5000,
      ...options
    }

    toasts.value.push(toastItem)

    // Auto-remove after duration
    if (toastItem.duration && toastItem.duration > 0) {
      setTimeout(() => {
        removeToast(toastItem.id)
      }, toastItem.duration)
    }

    return toastItem.id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Simple toast function matching shadcn/ui pattern
  function toast(options: ToastOptions) {
    const variant = options.variant || 'default'
    const duration = options.duration || (variant === 'destructive' ? TOAST_CONFIG.ERROR_DURATION : TOAST_CONFIG.SUCCESS_DURATION)
    return showToast({
      title: options.title,
      message: options.description,
      variant,
      duration,
    })
  }

  function success(message: string, title?: string) {
    return showToast({ message, title, variant: 'success', duration: TOAST_CONFIG.SUCCESS_DURATION })
  }

  function error(message: string, title?: string) {
    return showToast({ message, title, variant: 'error', duration: TOAST_CONFIG.ERROR_DURATION })
  }

  function warning(message: string, title?: string) {
    return showToast({ message, title, variant: 'warning', duration: TOAST_CONFIG.WARNING_DURATION })
  }

  function info(message: string, title?: string) {
    return showToast({ message, title, variant: 'info', duration: TOAST_CONFIG.INFO_DURATION })
  }

  function clearAll() {
    toasts.value = []
  }

  return {
    toasts,
    toast,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll
  }
}