<template>
  <div :class="['splash-screen', { 'fade-out': fadeOut }]">
    <div class="splash-content">
      <!-- Logo -->
      <div class="splash-logo">
        <Server class="w-12 h-12 text-primary" />
      </div>
      
      <!-- Title -->
      <h1 class="splash-title">CLI Proxy API</h1>
      <p class="splash-subtitle">Management Panel</p>
      
      <!-- Loading Bar -->
      <div class="splash-loader">
        <div class="splash-loader-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, onMounted } from 'vue'
import { Server } from 'lucide-vue-next'
import { useDarkMode } from '@/composables/useDarkMode'

interface Props {
  fadeOut?: boolean
  onFinish: () => void
}

const props = withDefaults(defineProps<Props>(), {
  fadeOut: false
})

const FADE_OUT_DURATION = 400

// Initialize dark mode to ensure theme is applied
const { isDark } = useDarkMode()

onMounted(() => {
  // Ensure theme is applied immediately
  document.documentElement.classList.toggle('dark', isDark.value)
})

watchEffect((onInvalidate) => {
  if (!props.fadeOut) return
  
  const finishTimer = setTimeout(() => {
    props.onFinish()
  }, FADE_OUT_DURATION)

  onInvalidate(() => {
    clearTimeout(finishTimer)
  })
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background));
  opacity: 1;
  transition: opacity 0.4s cubic-bezier(0, 0, 0.2, 1);
}

.splash-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: splash-enter 0.6s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes splash-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.splash-logo {
  width: 80px;
  height: 80px;
  border-radius: 1.5rem;
  background: hsl(var(--primary) / 0.1);
  border: 1px solid hsl(var(--primary) / 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: splash-logo-pulse 1.5s ease-in-out infinite;
  transform: rotate(3deg);
  transition: transform 0.5s cubic-bezier(0, 0, 0.2, 1);
  
  /* 默认浅色模式阴影 */
  box-shadow: 
    0 10px 25px -5px hsl(var(--primary) / 0.1), 
    0 8px 10px -6px hsl(var(--primary) / 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.splash-logo:hover {
  transform: rotate(0deg);
}

@keyframes splash-logo-pulse {
  0%, 100% {
    transform: rotate(3deg) scale(1);
  }
  50% {
    transform: rotate(3deg) scale(1.05);
  }
}

.splash-title {
  font-size: 1.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0;
  letter-spacing: -0.025em;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  text-align: center;
}

.splash-subtitle {
  font-size: 1rem;
  font-weight: 300;
  color: hsl(var(--muted-foreground));
  margin: 0;
  margin-top: -0.5rem;
  text-align: center;
}

.splash-loader {
  width: 120px;
  height: 3px;
  background: hsl(var(--border));
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 1rem;
  
  /* 默认浅色模式内阴影 */
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.splash-loader-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 0.8),
    hsl(var(--primary))
  );
  border-radius: 9999px;
  animation: splash-loading 1.2s ease-in-out infinite;
  transform-origin: left;
  
  /* 默认浅色模式发光效果 */
  box-shadow: 0 0 8px hsl(var(--primary) / 0.25);
}

@keyframes splash-loading {
  0% {
    transform: scaleX(0);
  }
  50% {
    transform: scaleX(1);
    transform-origin: left;
  }
  50.01% {
    transform-origin: right;
  }
  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .splash-content {
    gap: 1.25rem;
    padding: 0 1rem;
  }
  
  .splash-logo {
    width: 64px;
    height: 64px;
  }
  
  .splash-logo :deep(svg) {
    width: 2rem;
    height: 2rem;
  }
  
  .splash-title {
    font-size: 1.5rem;
  }
  
  .splash-subtitle {
    font-size: 0.875rem;
  }
  
  .splash-loader {
    width: 100px;
  }
}

/* 深色模式特定样式 */
.dark .splash-logo {
  box-shadow: 
    0 10px 25px -5px hsl(var(--primary) / 0.2), 
    0 8px 10px -6px hsl(var(--primary) / 0.15),
    0 1px 3px rgba(0, 0, 0, 0.4);
}

.dark .splash-loader {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}

.dark .splash-loader-bar {
  box-shadow: 0 0 12px hsl(var(--primary) / 0.5);
}

/* 系统深色模式偏好 */
@media (prefers-color-scheme: dark) {
  .splash-logo {
    box-shadow: 
      0 10px 25px -5px hsl(var(--primary) / 0.2), 
      0 8px 10px -6px hsl(var(--primary) / 0.15),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  .splash-loader {
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .splash-loader-bar {
    box-shadow: 0 0 12px hsl(var(--primary) / 0.4);
  }
}

/* 当明确设置为浅色模式时，覆盖系统偏好 */
html:not(.dark) .splash-logo {
  box-shadow: 
    0 10px 25px -5px hsl(var(--primary) / 0.1), 
    0 8px 10px -6px hsl(var(--primary) / 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

html:not(.dark) .splash-loader {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

html:not(.dark) .splash-loader-bar {
  box-shadow: 0 0 8px hsl(var(--primary) / 0.25);
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .splash-content {
    animation: none;
  }
  
  .splash-logo {
    animation: none;
    transform: rotate(3deg);
  }
  
  .splash-loader-bar {
    animation: splash-loading-reduced 2s linear infinite;
  }
  
  @keyframes splash-loading-reduced {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
}
</style>