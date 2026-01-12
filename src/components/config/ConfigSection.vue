<template>
  <div class="config-section">
    <Card>
      <CardHeader>
        <CardTitle>{{ title }}</CardTitle>
        <CardDescription v-if="description">{{ description }}</CardDescription>
      </CardHeader>
      <CardContent>
        <slot />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface Props {
  title: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined
})</script>