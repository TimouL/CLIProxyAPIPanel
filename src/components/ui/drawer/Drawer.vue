<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex justify-end"
        @click.self="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          @click="handleBackdropClick"
        />

        <!-- 抽屉内容 -->
        <div
          class="relative h-full bg-background shadow-2xl overflow-hidden flex flex-col"
          :class="[
            widthClass,
            'transform transition-transform duration-300 ease-out'
          ]"
          @click.stop
        >
          <!-- Header 区域 -->
          <slot name="header">
            <div
              v-if="title"
              class="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex-shrink-0"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    v-if="icon"
                    class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0"
                    :class="iconClass"
                  >
                    <component
                      :is="icon"
                      class="h-5 w-5 text-primary"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-foreground leading-tight truncate">
                      {{ title }}
                    </h3>
                    <p
                      v-if="description"
                      class="text-sm text-muted-foreground mt-0.5"
                    >
                      {{ description }}
                    </p>
                  </div>
                </div>
                <button
                  class="h-8 w-8 flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="关闭"
                  @click="handleClose"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </slot>

          <!-- 内容区域 (可滚动) -->
          <div 
            class="flex-1 overflow-y-auto" 
            :class="noPadding ? '' : 'px-6 py-4'"
          >
            <slot />
          </div>

          <!-- Footer 区域 -->
          <div
            v-if="slots.footer"
            class="sticky bottom-0 z-10 border-t border-border px-6 py-4 bg-background/95 backdrop-blur-sm flex flex-row-reverse gap-3 flex-shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useSlots, onMounted, onUnmounted, type Component } from 'vue'
import { X } from 'lucide-vue-next'

// Props 定义
const props = defineProps<{
  open?: boolean
  modelValue?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  title?: string
  description?: string
  icon?: Component
  iconClass?: string
  noPadding?: boolean
  persistent?: boolean // 防止点击背景关闭
}>()

// Emits 定义
const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: boolean]
}>()

// 获取 slots
const slots = useSlots()

// 统一处理 open 状态
const isOpen = computed(() => {
  if (props.modelValue === true) return true
  if (props.open === true) return true
  return false
})

// 统一处理关闭事件
function handleClose() {
  if (props.open !== undefined) {
    emit('update:open', false)
  }
  if (props.modelValue !== undefined) {
    emit('update:modelValue', false)
  }
}

// 处理背景点击
function handleBackdropClick() {
  if (!props.persistent) {
    handleClose()
  }
}

// 宽度样式
const widthClass = computed(() => {
  const sizeValue = props.size || 'md'
  const sizes: Record<string, string> = {
    sm: 'w-80 sm:w-96',
    md: 'w-full sm:w-[500px]',
    lg: 'w-full sm:w-[600px]',
    xl: 'w-full sm:w-[700px]',
    '2xl': 'w-full sm:w-[800px]',
    '3xl': 'w-full sm:w-[900px]',
    full: 'w-full'
  }
  return sizes[sizeValue]
})

// ESC 键监听
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value && !props.persistent) {
    // 检查焦点是否在输入框中
    const activeElement = document.activeElement as HTMLElement
    const isInputElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.contentEditable === 'true'
    )
    
    if (!isInputElement) {
      handleClose()
      event.stopImmediatePropagation()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .relative,
.drawer-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .relative {
  transform: translateX(100%);
}

.drawer-leave-to .relative {
  transform: translateX(100%);
}

.drawer-enter-to .relative,
.drawer-leave-from .relative {
  transform: translateX(0);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .drawer-enter-from .relative,
  .drawer-leave-to .relative {
    transform: translateY(100%);
  }
}
</style>