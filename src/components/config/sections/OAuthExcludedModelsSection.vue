<template>
  <ConfigSection title="OAuth 排除模型" description="配置各渠道的排除模型列表">
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
            v-if="getChannelExcludedCount(channel.id) > 0"
            class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20"
          >
            {{ getChannelExcludedCount(channel.id) }}
          </span>
        </Button>
      </div>

      <!-- Active Channel Excluded Models -->
      <div class="space-y-3">
        <div
          v-for="(model, index) in activeChannelModels"
          :key="index"
          class="flex items-center gap-2"
        >
          <Input
            :model-value="model"
            placeholder="模型名或通配符模式"
            :disabled="disabled"
            class="flex-1"
            @update:model-value="updateModel(index, $event)"
          />
          <Button
            variant="ghost"
            size="icon"
            :disabled="disabled"
            class="shrink-0 text-muted-foreground hover:text-destructive"
            @click="removeModel(index)"
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

        <!-- Empty State -->
        <div
          v-if="activeChannelModels.length === 0"
          class="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg"
        >
          <p class="text-sm">暂无 {{ getChannelLabel(activeChannel) }} 排除模型</p>
          <p class="text-xs mt-1">点击下方按钮添加排除的模型</p>
        </div>

        <!-- Add Button -->
        <Button
          variant="outline"
          size="sm"
          :disabled="disabled"
          class="w-full"
          @click="addModel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          添加排除模型
        </Button>

        <!-- Wildcard Hint -->
        <p class="text-xs text-muted-foreground">
          支持通配符模式，如 gemini-2.5-*、*-preview
        </p>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigSection from '../ConfigSection.vue'
import { Input, Button } from '@/components/ui'
import type { OAuthExcludedModelsConfig } from '@/types/config'

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

interface OAuthExcludedModelsValues {
  oauthExcludedModels: OAuthExcludedModelsConfig
}

interface Props {
  values: OAuthExcludedModelsValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<OAuthExcludedModelsValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const activeChannel = ref('gemini-cli')

const activeChannelModels = computed(() => {
  return props.values.oauthExcludedModels[activeChannel.value] || []
})

const getChannelExcludedCount = (channelId: string) => {
  return props.values.oauthExcludedModels[channelId]?.length || 0
}

const getChannelLabel = (channelId: string) => {
  return availableChannels.find(c => c.id === channelId)?.label || channelId
}

const addModel = () => {
  const currentModels = props.values.oauthExcludedModels[activeChannel.value] || []
  const updatedConfig = {
    ...props.values.oauthExcludedModels,
    [activeChannel.value]: [...currentModels, '']
  }
  emit('update', { oauthExcludedModels: updatedConfig })
}

const removeModel = (index: number) => {
  const currentModels = props.values.oauthExcludedModels[activeChannel.value] || []
  const updatedConfig = {
    ...props.values.oauthExcludedModels,
    [activeChannel.value]: currentModels.filter((_, i) => i !== index)
  }
  emit('update', { oauthExcludedModels: updatedConfig })
}

const updateModel = (index: number, value: string) => {
  const currentModels = props.values.oauthExcludedModels[activeChannel.value] || []
  const updatedConfig = {
    ...props.values.oauthExcludedModels,
    [activeChannel.value]: currentModels.map((m, i) => i === index ? value : m)
  }
  emit('update', { oauthExcludedModels: updatedConfig })
}
</script>
