<template>
  <ConfigSection title="TLS/SSL 配置" description="HTTPS 安全连接设置">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-foreground">启用 TLS</h4>
          <p class="text-sm text-muted-foreground">启用 HTTPS 安全连接</p>
        </div>
        <Switch
          :model-value="values.tlsEnable"
          :disabled="disabled"
          @update:model-value="updateValue('tlsEnable', $event)"
        />
      </div>
      
      <div v-if="values.tlsEnable" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">证书文件路径</label>
          <Input
            :model-value="values.tlsCert"
            placeholder="/path/to/cert.pem"
            :disabled="disabled"
            @update:model-value="updateValue('tlsCert', $event)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">私钥文件路径</label>
          <Input
            :model-value="values.tlsKey"
            placeholder="/path/to/key.pem"
            :disabled="disabled"
            @update:model-value="updateValue('tlsKey', $event)"
          />
        </div>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input, Switch } from '@/components/ui'

interface TlsConfigValues {
  tlsEnable: boolean
  tlsCert: string
  tlsKey: string
}

interface Props {
  values: TlsConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<TlsConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof TlsConfigValues>(key: K, value: TlsConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
