<template>
  <div class="model-mapping-editor space-y-3">
    <div
      v-for="(entry, index) in entries"
      :key="entry.id"
      class="flex items-center gap-2"
    >
      <Input
        :model-value="entry.name"
        :placeholder="namePlaceholder"
        :disabled="disabled"
        class="flex-1"
        @update:model-value="updateEntryName(index, $event)"
      />
      <span class="text-muted-foreground shrink-0">→</span>
      <Input
        :model-value="entry.alias"
        :placeholder="aliasPlaceholder"
        :disabled="disabled"
        class="flex-1"
        @update:model-value="updateEntryAlias(index, $event)"
      />
      <Button
        variant="ghost"
        size="icon"
        :disabled="disabled"
        class="shrink-0 text-muted-foreground hover:text-destructive"
        @click="removeEntry(index)"
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
      @click="addEntry"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
      添加映射
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Input, Button } from '@/components/ui'
import type { ModelMappingEntry } from '@/types/config'
import { makeClientId } from '@/types/config'

interface Props {
  modelValue: ModelMappingEntry[]
  disabled?: boolean
  namePlaceholder?: string
  aliasPlaceholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: ModelMappingEntry[]): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  namePlaceholder: '原始模型名',
  aliasPlaceholder: '别名'
})

const emit = defineEmits<Emits>()

const entries = computed(() => props.modelValue)

const addEntry = () => {
  const newEntries = [...props.modelValue, { id: makeClientId(), name: '', alias: '' }]
  emit('update:modelValue', newEntries)
}

const removeEntry = (index: number) => {
  const newEntries = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newEntries)
}

const updateEntryName = (index: number, name: string) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === index ? { ...entry, name } : entry
  )
  emit('update:modelValue', newEntries)
}

const updateEntryAlias = (index: number, alias: string) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === index ? { ...entry, alias } : entry
  )
  emit('update:modelValue', newEntries)
}
</script>
