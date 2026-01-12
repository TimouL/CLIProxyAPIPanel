<template>
  <div class="string-list-editor space-y-3">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="flex items-center gap-2"
    >
      <Input
        :model-value="item"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1"
        @update:model-value="updateItem(index, $event)"
      />
      <Button
        variant="ghost"
        size="icon"
        :disabled="disabled"
        class="shrink-0 text-muted-foreground hover:text-destructive"
        @click="removeItem(index)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </Button>
    </div>
    
    <Button
      variant="outline"
      size="sm"
      :disabled="disabled"
      class="w-full"
      @click="addItem"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      添加
    </Button>
    
    <p v-if="showWildcardHint" class="text-xs text-muted-foreground">
      支持通配符模式，如 gemini-2.5-*、*-preview
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Input, Button } from '@/components/ui'

interface Props {
  modelValue: string[]
  disabled?: boolean
  placeholder?: string
  showWildcardHint?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '输入值',
  showWildcardHint: false
})

const emit = defineEmits<Emits>()

const items = computed(() => props.modelValue)

const addItem = () => {
  const newItems = [...props.modelValue, '']
  emit('update:modelValue', newItems)
}

const removeItem = (index: number) => {
  const newItems = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newItems)
}

const updateItem = (index: number, value: string) => {
  const newItems = props.modelValue.map((item, i) =>
    i === index ? value : item
  )
  emit('update:modelValue', newItems)
}
</script>
