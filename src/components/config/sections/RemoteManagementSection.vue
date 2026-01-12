<template>
  <ConfigSection title="远程管理" description="远程访问和控制面板设置">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-foreground">允许远程访问</h4>
          <p class="text-sm text-muted-foreground">允许从其他主机访问管理接口</p>
        </div>
        <Switch
          :model-value="values.rmAllowRemote"
          :disabled="disabled"
          @update:model-value="updateValue('rmAllowRemote', $event)"
        />
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-foreground">禁用控制面板</h4>
          <p class="text-sm text-muted-foreground">禁用内置的 Web 控制面板</p>
        </div>
        <Switch
          :model-value="values.rmDisableControlPanel"
          :disabled="disabled"
          @update:model-value="updateValue('rmDisableControlPanel', $event)"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">管理密钥</label>
          <Input
            :model-value="values.rmSecretKey"
            type="password"
            placeholder="设置管理密钥"
            :disabled="disabled"
            @update:model-value="updateValue('rmSecretKey', $event)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">面板仓库</label>
          <Input
            :model-value="values.rmPanelRepo"
            placeholder="github.com/user/panel-repo"
            :disabled="disabled"
            @update:model-value="updateValue('rmPanelRepo', $event)"
          />
        </div>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input, Switch } from '@/components/ui'

interface RemoteManagementValues {
  rmAllowRemote: boolean
  rmDisableControlPanel: boolean
  rmSecretKey: string
  rmPanelRepo: string
}

interface Props {
  values: RemoteManagementValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<RemoteManagementValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof RemoteManagementValues>(key: K, value: RemoteManagementValues[K]) => {
  emit('update', { [key]: value })
}
</script>
