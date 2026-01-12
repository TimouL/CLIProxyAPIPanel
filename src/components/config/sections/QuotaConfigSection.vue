<template>
  <ConfigSection title="配额回退" description="配额耗尽时的回退策略">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-foreground">切换项目</h4>
          <p class="text-sm text-muted-foreground">配额耗尽时自动切换到其他项目</p>
        </div>
        <Switch
          :model-value="values.quotaSwitchProject"
          :disabled="disabled"
          @update:model-value="updateValue('quotaSwitchProject', $event)"
        />
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-foreground">切换预览模型</h4>
          <p class="text-sm text-muted-foreground">配额耗尽时切换到预览版本模型</p>
        </div>
        <Switch
          :model-value="values.quotaSwitchPreviewModel"
          :disabled="disabled"
          @update:model-value="updateValue('quotaSwitchPreviewModel', $event)"
        />
      </div>
    </div>
  </ConfigSection>
</template>

<script setup lang="ts">
import ConfigSection from '../ConfigSection.vue'
import { Switch } from '@/components/ui'

interface QuotaConfigValues {
  quotaSwitchProject: boolean
  quotaSwitchPreviewModel: boolean
}

interface Props {
  values: QuotaConfigValues
  disabled?: boolean
}

interface Emits {
  (e: 'update', values: Partial<QuotaConfigValues>): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const updateValue = <K extends keyof QuotaConfigValues>(key: K, value: QuotaConfigValues[K]) => {
  emit('update', { [key]: value })
}
</script>
