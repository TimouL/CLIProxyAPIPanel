<template>
  <div class="upstream-api-key-mapping-editor space-y-4">
    <div
      v-for="(entry, index) in entries"
      :key="entry.id"
      class="border border-border rounded-lg p-4 space-y-3"
    >
      <div class="flex items-center justify-between">
        <h5 class="text-sm font-medium text-foreground">映射 {{ index + 1 }}</h5>
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

      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-1">上游 API 密钥</label>
        <Input
          :model-value="entry.upstreamApiKey"
          type="password"
          placeholder="输入上游 API 密钥"
          :disabled="disabled"
          @update:model-value="updateEntryUpstreamKey(index, $event)"
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-1">客户端 API 密钥列表</label>
        <p class="text-xs text-muted-foreground mb-2">这些客户端密钥将映射到上面的上游密钥</p>
        <div class="space-y-2">
          <div
            v-for="(apiKey, keyIndex) in entry.apiKeys"
            :key="keyIndex"
            class="flex items-center gap-2"
          >
            <Input
              :model-value="apiKey"
              placeholder="客户端 API 密钥"
              :disabled="disabled"
              class="flex-1"
              @update:model-value="updateApiKey(index, keyIndex, $event)"
            />
            <Button
              variant="ghost"
              size="icon"
              :disabled="disabled"
              class="shrink-0 text-muted-foreground hover:text-destructive"
              @click="removeApiKey(index, keyIndex)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="disabled"
            class="w-full"
            @click="addApiKey(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            添加客户端密钥
          </Button>
        </div>
      </div>
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
      添加密钥映射
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Input, Button } from '@/components/ui'
import type { AmpUpstreamApiKeyMapping } from '@/types/config'
import { makeClientId } from '@/types/config'

interface Props {
  modelValue: AmpUpstreamApiKeyMapping[]
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: AmpUpstreamApiKeyMapping[]): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const entries = computed(() => props.modelValue)

const addEntry = () => {
  const newEntries = [...props.modelValue, { id: makeClientId(), upstreamApiKey: '', apiKeys: [] }]
  emit('update:modelValue', newEntries)
}

const removeEntry = (index: number) => {
  const newEntries = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newEntries)
}

const updateEntryUpstreamKey = (index: number, upstreamApiKey: string) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === index ? { ...entry, upstreamApiKey } : entry
  )
  emit('update:modelValue', newEntries)
}

const addApiKey = (entryIndex: number) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === entryIndex ? { ...entry, apiKeys: [...entry.apiKeys, ''] } : entry
  )
  emit('update:modelValue', newEntries)
}

const removeApiKey = (entryIndex: number, keyIndex: number) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === entryIndex ? { ...entry, apiKeys: entry.apiKeys.filter((_, ki) => ki !== keyIndex) } : entry
  )
  emit('update:modelValue', newEntries)
}

const updateApiKey = (entryIndex: number, keyIndex: number, value: string) => {
  const newEntries = props.modelValue.map((entry, i) =>
    i === entryIndex
      ? { ...entry, apiKeys: entry.apiKeys.map((key, ki) => ki === keyIndex ? value : key) }
      : entry
  )
  emit('update:modelValue', newEntries)
}
</script>
