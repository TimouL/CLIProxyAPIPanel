<template>
  <Badge :variant="badgeVariant" :class="badgeClasses">
    <component
      :is="statusIcon"
      v-if="showIcon && statusIcon"
      class="mr-1 h-3 w-3"
    />
    {{ displayLabel }}
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Minus
} from 'lucide-vue-next'
import type { Component } from 'vue'

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'neutral' | 'active' | 'inactive'
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface Props {
  /** 状态类型 */
  status: StatusType
  /** 自定义标签文本 */
  label?: string
  /** 是否显示图标 */
  showIcon?: boolean
  /** 徽章变体 */
  variant?: 'solid' | 'soft' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  showIcon: true,
  variant: 'soft'
})

// 状态配置
const statusConfig = computed(() => {
  const configs = {
    success: {
      icon: CheckCircle2,
      label: '成功',
      colors: {
        solid: 'bg-green-600 text-white border-green-600',
        soft: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        outline: 'text-green-600 border-green-600 dark:text-green-400 dark:border-green-400'
      }
    },
    error: {
      icon: XCircle,
      label: '错误',
      colors: {
        solid: 'bg-red-600 text-white border-red-600',
        soft: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        outline: 'text-red-600 border-red-600 dark:text-red-400 dark:border-red-400'
      }
    },
    warning: {
      icon: AlertCircle,
      label: '警告',
      colors: {
        solid: 'bg-yellow-600 text-white border-yellow-600',
        soft: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        outline: 'text-yellow-600 border-yellow-600 dark:text-yellow-400 dark:border-yellow-400'
      }
    },
    info: {
      icon: Info,
      label: '信息',
      colors: {
        solid: 'bg-blue-600 text-white border-blue-600',
        soft: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        outline: 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
      }
    },
    pending: {
      icon: Clock,
      label: '待处理',
      colors: {
        solid: 'bg-gray-600 text-white border-gray-600',
        soft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
        outline: 'text-gray-600 border-gray-600 dark:text-gray-400 dark:border-gray-400'
      }
    },
    neutral: {
      icon: Minus,
      label: '中性',
      colors: {
        solid: 'bg-gray-600 text-white border-gray-600',
        soft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
        outline: 'text-gray-600 border-gray-600 dark:text-gray-400 dark:border-gray-400'
      }
    },
    active: {
      icon: CheckCircle2,
      label: '活跃',
      colors: {
        solid: 'bg-primary text-primary-foreground border-primary',
        soft: 'bg-primary/10 text-primary border-primary/20',
        outline: 'text-primary border-primary'
      }
    },
    inactive: {
      icon: Minus,
      label: '未激活',
      colors: {
        solid: 'bg-gray-600 text-white border-gray-600',
        soft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
        outline: 'text-gray-600 border-gray-600 dark:text-gray-400 dark:border-gray-400'
      }
    }
  }

  return configs[props.status]
})

// 状态图标
const statusIcon = computed(() => statusConfig.value.icon)

// 显示标签
const displayLabel = computed(() => props.label || statusConfig.value.label)

// 徽章变体映射
const badgeVariant = computed((): BadgeVariant => {
  if (props.variant === 'outline') return 'outline'
  if (props.status === 'error') return 'destructive'
  if (props.variant === 'solid') return 'default'
  return 'secondary'
})

// 徽章样式类
const badgeClasses = computed(() => {
  const colorClasses = statusConfig.value.colors[props.variant]
  return `${colorClasses} font-medium`
})
</script>