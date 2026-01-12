<template>
  <ConfigSection title="认证配置" description="API 密钥和认证文件设置">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">认证文件目录</label>
        <Input
          :model-value="values.authDir"
          placeholder="./auths"
          :disabled="disabled"
          @update:model-value="updateValue('authDir', $event)"
        />
        <p class="text-xs text-muted-foreground mt-1">存放认证文件的目录路径</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-foreground mb-2">API 密钥列表</label>
        <Textarea
          :model-value="values.apiKeysText"
          placeholder="每行一个 API 密钥"
          rows="4"
          :disabled="disabled"
          @update:model-value="updateValue('apiKeysText', $event)"
        />
        <p class="text-xs text-muted-foreground mt-1">每行输入一个 API 密钥</p>
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Input, Textarea } from '@/components/ui'

interface AuthConfigValues {
  authDir: string
  apiKeysText: string
}

interface Props {
  values: AuthConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<AuthConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof AuthConfigValues>(key: K, value: AuthConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
