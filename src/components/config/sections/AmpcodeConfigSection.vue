<template>
  <ConfigSection title="Ampcode 配置" description="配置 Amp 集成设置">
    <div class="space-y-6">
      <!-- Basic Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">上游 URL</label>
          <Input
            :model-value="values.ampUpstreamUrl"
            placeholder="https://api.example.com"
            :disabled="disabled"
            @update:model-value="updateValue('ampUpstreamUrl', $event)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">上游 API 密钥</label>
          <Input
            :model-value="values.ampUpstreamApiKey"
            type="password"
            placeholder="输入上游 API 密钥"
            :disabled="disabled"
            @update:model-value="updateValue('ampUpstreamApiKey', $event)"
          />
        </div>
      </div>

      <!-- Switches -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-foreground">限制管理到本地</h4>
            <p class="text-sm text-muted-foreground">仅允许本地访问管理接口</p>
          </div>
          <Switch
            :model-value="values.ampRestrictManagementToLocalhost"
            :disabled="disabled"
            @update:model-value="updateValue('ampRestrictManagementToLocalhost', $event)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-foreground">强制模型映射</h4>
            <p class="text-sm text-muted-foreground">强制使用配置的模型映射</p>
          </div>
          <Switch
            :model-value="values.ampForceModelMappings"
            :disabled="disabled"
            @update:model-value="updateValue('ampForceModelMappings', $event)"
          />
        </div>
      </div>

      <!-- Model Mappings -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">模型映射</label>
        <p class="text-xs text-muted-foreground mb-3">配置模型名称的映射关系（from → to）</p>
        <AmpModelMappingEditor
          :model-value="values.ampModelMappings"
          :disabled="disabled"
          @update:model-value="updateValue('ampModelMappings', $event)"
        />
      </div>

      <!-- Upstream API Keys Mapping -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">上游 API 密钥映射</label>
        <p class="text-xs text-muted-foreground mb-3">将客户端 API 密钥映射到不同的上游密钥</p>
        <UpstreamApiKeyMappingEditor
          :model-value="values.ampUpstreamApiKeys"
          :disabled="disabled"
          @update:model-value="updateValue('ampUpstreamApiKeys', $event)"
        />
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input, Switch } from '@/components/ui'
import AmpModelMappingEditor from '../editors/AmpModelMappingEditor.vue'
import UpstreamApiKeyMappingEditor from '../editors/UpstreamApiKeyMappingEditor.vue'
import type { AmpModelMappingEntry, AmpUpstreamApiKeyMapping } from '@/types/config'

interface AmpcodeConfigValues {
  ampUpstreamUrl: string
  ampUpstreamApiKey: string
  ampRestrictManagementToLocalhost: boolean
  ampForceModelMappings: boolean
  ampModelMappings: AmpModelMappingEntry[]
  ampUpstreamApiKeys: AmpUpstreamApiKeyMapping[]
}

interface Props {
  values: AmpcodeConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<AmpcodeConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof AmpcodeConfigValues>(key: K, value: AmpcodeConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
