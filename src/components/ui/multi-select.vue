<template>
  <div class="relative">
    <div
      :class="triggerClass"
      @click="handleToggle"
    >
      <div class="flex-1 flex items-center gap-1 min-w-0">
        <!-- 显示选中的项目 -->
        <div v-if="selectedOptions.length === 0" class="text-muted-foreground">
          {{ placeholder }}
        </div>
        <div v-else class="flex items-center gap-1 flex-wrap">
          <div
            v-for="option in selectedOptions.slice(0, maxDisplayItems)"
            :key="option.value"
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs"
          >
            <span class="truncate max-w-20">{{ option.label }}</span>
            <button
              type="button"
              class="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
              @click.stop="removeOption(option.value)"
            >
              <X class="h-3 w-3" />
            </button>
          </div>
          <div
            v-if="selectedOptions.length > maxDisplayItems"
            class="inline-flex items-center px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-xs"
          >
            +{{ selectedOptions.length - maxDisplayItems }}
          </div>
        </div>
      </div>
      
      <ChevronDown 
        :class="[
          'h-4 w-4 opacity-50 transition-transform duration-200',
          open && 'rotate-180'
        ]" 
      />
    </div>

    <!-- 下拉内容 -->
    <div
      v-if="open"
      :class="contentClass"
      @click.stop
    >
      <!-- 搜索框 -->
      <div v-if="searchable" class="p-2 border-b border-border/60">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10 pointer-events-none" />
          <Input
            ref="searchInputRef"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="h-8 text-xs pl-8 border-border/60"
            @keydown.escape="handleEscape"
          />
        </div>
      </div>

      <!-- 全选/清空操作 -->
      <div v-if="showSelectAll" class="p-2 border-b border-border/60 flex items-center justify-between">
        <button
          type="button"
          class="text-xs text-primary hover:text-primary/80 transition-colors"
          @click="selectAll"
        >
          全选
        </button>
        <button
          type="button"
          class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          @click="clearAll"
        >
          清空
        </button>
      </div>
      
      <!-- 选项列表 -->
      <div class="max-h-60 overflow-y-auto">
        <div
          v-if="filteredOptions.length === 0 && searchQuery"
          class="text-muted-foreground text-center py-4 text-sm"
        >
          {{ noResultsText }}
        </div>
        
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          :class="[
            'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors',
            option.disabled && 'opacity-50 cursor-not-allowed'
          ]"
          @click="!option.disabled && toggleOption(option.value)"
        >
          <div
            :class="[
              'w-4 h-4 border border-border rounded flex items-center justify-center transition-colors',
              isSelected(option.value) && 'bg-primary border-primary text-primary-foreground'
            ]"
          >
            <Check v-if="isSelected(option.value)" class="h-3 w-3" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm">{{ option.label }}</div>
            <div v-if="option.description" class="text-xs text-muted-foreground">
              {{ option.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="open"
      class="fixed inset-0 z-[199]"
      @click="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Input } from '@/components/ui'
import { Search, ChevronDown, X, Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue: string[]
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  searchable?: boolean
  showSelectAll?: boolean
  maxDisplayItems?: number
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择...',
  searchPlaceholder: '搜索选项...',
  noResultsText: '未找到匹配项',
  searchable: true,
  showSelectAll: true,
  maxDisplayItems: 3,
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const open = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement>()

const triggerClass = computed(() =>
  cn(
    'flex h-11 w-full items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer backdrop-blur transition-all',
    props.disabled && 'cursor-not-allowed opacity-50',
    props.class
  )
)

const contentClass = computed(() =>
  cn(
    'absolute top-full left-0 right-0 mt-1 z-[200] max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop-blur-xl',
    'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
  )
)

const selectedOptions = computed(() => {
  return props.options.filter(option => props.modelValue.includes(option.value))
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => 
    option.label.toLowerCase().includes(query) ||
    option.description?.toLowerCase().includes(query) ||
    option.value.toLowerCase().includes(query)
  )
})

function isSelected(value: string): boolean {
  return props.modelValue.includes(value)
}

function toggleOption(value: string) {
  const newValue = isSelected(value)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value]
  
  emit('update:modelValue', newValue)
}

function removeOption(value: string) {
  const newValue = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', newValue)
}

function selectAll() {
  const availableValues = filteredOptions.value
    .filter(option => !option.disabled)
    .map(option => option.value)
  
  const newValue = [...new Set([...props.modelValue, ...availableValues])]
  emit('update:modelValue', newValue)
}

function clearAll() {
  emit('update:modelValue', [])
}

function handleToggle() {
  if (props.disabled) return
  
  open.value = !open.value
  
  if (open.value) {
    searchQuery.value = ''
    
    if (props.searchable) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
}

function handleClose() {
  open.value = false
  searchQuery.value = ''
}

function handleEscape() {
  handleClose()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>