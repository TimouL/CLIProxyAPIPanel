<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'aether'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'aether'
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'aether',
  padding: 'none',
})

const containerClasses = computed(() => {
  const classes = ['w-full']

  // Max width - Aether 风格的自适应全宽布局
  const maxWidthMap = {
    sm: 'max-w-screen-sm mx-auto',
    md: 'max-w-screen-md mx-auto',
    lg: 'max-w-screen-lg mx-auto',
    xl: 'max-w-screen-xl mx-auto',
    '2xl': 'max-w-screen-2xl mx-auto',
    full: 'max-w-full',
    aether: 'max-w-full', // Aether 风格：自适应全宽，无最大宽度限制
  }
  classes.push(maxWidthMap[props.maxWidth])

  // Padding - Aether 风格的紧凑内边距
  const paddingMap = {
    none: '',
    sm: 'px-4 py-4',
    md: 'px-4 py-6 sm:px-6 lg:px-8',
    lg: 'px-6 py-8 sm:px-8 lg:px-12',
    aether: 'px-6 py-4', // Aether 风格：更紧凑的内边距
  }
  if (props.padding !== 'none') {
    classes.push(paddingMap[props.padding])
  }

  return classes.join(' ')
})
</script>
