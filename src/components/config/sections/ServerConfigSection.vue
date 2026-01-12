<template>
  <ConfigSection title="服务器配置" description="基础服务器设置">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">主机地址</label>
        <Input
          :model-value="values.host"
          placeholder="0.0.0.0"
          :disabled="disabled"
          @update:model-value="updateValue('host', $event)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">端口</label>
        <Input
          :model-value="values.port"
          type="number"
          placeholder="8080"
          :disabled="disabled"
          @update:model-value="updateValue('port', $event)"
        />
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input } from '@/components/ui'

interface ServerConfigValues {
  host: string
  port: string
}

interface Props {
  values: ServerConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<ServerConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof ServerConfigValues>(key: K, value: ServerConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
