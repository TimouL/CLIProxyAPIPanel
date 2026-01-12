<template>
  <ConfigSection title="网络配置" description="代理、重试和路由设置">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">代理 URL</label>
          <Input
            :model-value="values.proxyUrl"
            placeholder="http://proxy.example.com:8080"
            :disabled="disabled"
            @update:model-value="updateValue('proxyUrl', $event)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">请求重试次数</label>
          <Input
            :model-value="values.requestRetry"
            type="number"
            placeholder="3"
            :disabled="disabled"
            @update:model-value="updateValue('requestRetry', $event)"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">最大重试间隔 (ms)</label>
          <Input
            :model-value="values.maxRetryInterval"
            type="number"
            placeholder="5000"
            :disabled="disabled"
            @update:model-value="updateValue('maxRetryInterval', $event)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">路由策略</label>
          <SearchableSelect
            :model-value="values.routingStrategy"
            :options="routingOptions"
            placeholder="选择路由策略"
            :searchable="false"
            :disabled="disabled"
            class="w-full"
            @update:model-value="updateValue('routingStrategy', $event)"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-foreground">强制模型前缀</h4>
            <p class="text-sm text-muted-foreground">为所有模型名称添加前缀</p>
          </div>
          <Switch
            :model-value="values.forceModelPrefix"
            :disabled="disabled"
            @update:model-value="updateValue('forceModelPrefix', $event)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-foreground">WebSocket 认证</h4>
            <p class="text-sm text-muted-foreground">启用 WebSocket 连接认证</p>
          </div>
          <Switch
            :model-value="values.wsAuth"
            :disabled="disabled"
            @update:model-value="updateValue('wsAuth', $event)"
          />
        </div>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input, Switch, SearchableSelect } from '@/components/ui'

interface NetworkConfigValues {
  proxyUrl: string
  requestRetry: string
  maxRetryInterval: string
  routingStrategy: 'round-robin' | 'fill-first'
  forceModelPrefix: boolean
  wsAuth: boolean
}

interface Props {
  values: NetworkConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<NetworkConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const routingOptions = [
  { value: 'round-robin', label: '轮询 (Round Robin)' },
  { value: 'fill-first', label: '填充优先 (Fill First)' }
]

const updateValue = <K extends keyof NetworkConfigValues>(key: K, value: NetworkConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
