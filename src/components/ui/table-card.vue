<template>
  <Card class="overflow-hidden">
    <div class="px-4 py-3 border-b flex items-center justify-between gap-4">
      <h3 class="text-sm font-medium">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2 flex-wrap">
        <slot name="actions" />
      </div>
    </div>
    <div class="overflow-x-auto">
      <slot />
    </div>
    <div v-if="$slots.pagination" class="px-4 py-3 border-t">
      <slot name="pagination" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from './card.vue'

defineProps<{
  title: string
}>()
</script>
