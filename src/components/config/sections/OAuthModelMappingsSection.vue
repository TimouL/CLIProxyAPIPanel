<template>
  <ConfigSection title="OAuth 模型映射" description="配置各渠道的模型名称映射">
    <div class="space-y-4">
      <!-- Channel Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-border pb-2">
        <Button
          v-for="channel in availableChannels"
          :key="channel.id"
          :variant="activeChannel === channel.id ? 'default' : 'ghost'"
          size="sm"
          @click="activeChannel = channel.id"
        >
          {{ channel.label }}
          <span
            v-if="getChannelMappingCount(channel.id) > 0"
            class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20"
          >
            {{ getChannelMappingCount(channel.id) }}
          </span>
        </Button>
      </div>

      <!-- Active Channel Mappings -->
      <div v-if="activeChannelMappings" class="space-y-4">
        <div
          v-for="(entry, index) in activeChannelMappings.entries"
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
              @click="removeMapping(index)"
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-muted-foreground mb-1">原始模型名</label>
              <Input
                :model-value="entry.name"
                placeholder="例如: gemini-pro"
                :disabled="disabled"
                @update:model-value="updateMappingName(index, $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-muted-foreground mb-1">别名</label>
              <Input
                :model-value="entry.alias"
                placeholder="例如: gpt-4"
                :disabled="disabled"
                @update:model-value="updateMappingAlias(index, $event)"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h6 class="text-sm font-medium text-foreground">Fork 模式</h6>
              <p class="text-xs text-muted-foreground">保留原始模型并添加别名</p>
            </div>
            <Switch
              :model-value="entry.fork"
              :disabled="disabled"
              @update:model-value="updateMappingFork(index, $event)"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="activeChannelMappings.entries.length === 0"
          class="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg"
        >
          <p class="text-sm">暂无 {{ getChannelLabel(activeChannel) }} 模型映射</p>
          <p class="text-xs mt-1">点击下方按钮添加新的映射</p>
        </div>

        <!-- Add Button -->
        <Button
          variant="outline"
          size="sm"
          :disabled="disabled"
          class="w-full"
          @click="addMapping"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          添加 {{ getChannelLabel(activeChannel) }} 模型映射
        </Button>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigSection from '../ConfigSection.vue'
import { Input, Switch, Button } from '@/components/ui'
import type { OauthChannelMappings, OauthModelMappingEntry } from '@/types/config'
import { makeClientId } from '@/types/config'

const availableChannels = [
  { id: 'gemini-cli', label: 'Gemini CLI' },
  { id: 'vertex', label: 'Vertex' },
  { id: 'aistudio', label: 'AI Studio' },
  { id: 'antigravity', label: 'Antigravity' },
  { id: 'claude', label: 'Claude' },
  { id: 'codex', label: 'Codex' },
  { id: 'qwen', label: 'Qwen' },
  { id: 'iflow', label: 'iFlow' }
]

interface OAuthModelMappingsValues {
  oauthModelMappings: OauthChannelMappings[]
}

interface Props {
  values: OAuthModelMappingsValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<OAuthModelMappingsValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const activeChannel = ref('gemini-cli')

const activeChannelMappings = computed(() => {
  return props.values.oauthModelMappings.find(m => m.channel === activeChannel.value)
})

const getChannelMappingCount = (channelId: string) => {
  const mapping = props.values.oauthModelMappings.find(m => m.channel === channelId)
  return mapping?.entries.length || 0
}

const getChannelLabel = (channelId: string) => {
  return availableChannels.find(c => c.id === channelId)?.label || channelId
}

const ensureChannelExists = (): OauthChannelMappings[] => {
  const existing = props.values.oauthModelMappings.find(m => m.channel === activeChannel.value)
  if (existing) {
    return props.values.oauthModelMappings
  }
  return [
    ...props.values.oauthModelMappings,
    {
      id: makeClientId(),
      channel: activeChannel.value,
      originalChannel: activeChannel.value,
      entries: []
    }
  ]
}

const addMapping = () => {
  const mappings = ensureChannelExists()
  const newEntry: OauthModelMappingEntry = {
    id: makeClientId(),
    name: '',
    alias: '',
    fork: false
  }
  
  const updatedMappings = mappings.map(m =>
    m.channel === activeChannel.value
      ? { ...m, entries: [...m.entries, newEntry] }
      : m
  )
  
  emit('update', { oauthModelMappings: updatedMappings })
}

const removeMapping = (index: number) => {
  const updatedMappings = props.values.oauthModelMappings.map(m =>
    m.channel === activeChannel.value
      ? { ...m, entries: m.entries.filter((_, i) => i !== index) }
      : m
  )
  emit('update', { oauthModelMappings: updatedMappings })
}

const updateMappingName = (index: number, name: string) => {
  const updatedMappings = props.values.oauthModelMappings.map(m =>
    m.channel === activeChannel.value
      ? { ...m, entries: m.entries.map((e, i) => i === index ? { ...e, name } : e) }
      : m
  )
  emit('update', { oauthModelMappings: updatedMappings })
}

const updateMappingAlias = (index: number, alias: string) => {
  const updatedMappings = props.values.oauthModelMappings.map(m =>
    m.channel === activeChannel.value
      ? { ...m, entries: m.entries.map((e, i) => i === index ? { ...e, alias } : e) }
      : m
  )
  emit('update', { oauthModelMappings: updatedMappings })
}

const updateMappingFork = (index: number, fork: boolean) => {
  const updatedMappings = props.values.oauthModelMappings.map(m =>
    m.channel === activeChannel.value
      ? { ...m, entries: m.entries.map((e, i) => i === index ? { ...e, fork } : e) }
      : m
  )
  emit('update', { oauthModelMappings: updatedMappings })
}
</script>
