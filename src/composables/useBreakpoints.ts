import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点配置（与 Tailwind CSS 保持一致）
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

type BreakpointKey = keyof typeof breakpoints
type CurrentBreakpoint = 'xs' | BreakpointKey

const windowWidth = ref(0)

let initialized = false
let resizeHandler: (() => void) | null = null

const updateWindowWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

const initialize = () => {
  if (initialized || typeof window === 'undefined') {
    return
  }

  initialized = true
  updateWindowWidth()

  resizeHandler = () => updateWindowWidth()
  window.addEventListener('resize', resizeHandler)
}

const cleanup = () => {
  if (resizeHandler && typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
}

export function useBreakpoints() {
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    cleanup()
  })

  // 确保在服务端渲染时也能正常工作
  if (typeof window !== 'undefined' && !initialized) {
    initialize()
  }

  // 各个断点的响应式状态
  const isSm = computed(() => windowWidth.value >= breakpoints.sm)
  const isMd = computed(() => windowWidth.value >= breakpoints.md)
  const isLg = computed(() => windowWidth.value >= breakpoints.lg)
  const isXl = computed(() => windowWidth.value >= breakpoints.xl)
  const is2Xl = computed(() => windowWidth.value >= breakpoints['2xl'])

  // 当前断点
  const current = computed((): CurrentBreakpoint => {
    const width = windowWidth.value
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })

  // 便捷的设备类型判断
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

  // 检查是否匹配指定断点
  const matches = (breakpoint: BreakpointKey) => {
    return computed(() => windowWidth.value >= breakpoints[breakpoint])
  }

  // 检查是否在指定断点范围内
  const between = (min: BreakpointKey, max: BreakpointKey) => {
    return computed(() => {
      const width = windowWidth.value
      return width >= breakpoints[min] && width < breakpoints[max]
    })
  }

  // 检查是否小于指定断点
  const smaller = (breakpoint: BreakpointKey) => {
    return computed(() => windowWidth.value < breakpoints[breakpoint])
  }

  return {
    // 窗口宽度
    windowWidth,
    
    // 断点状态
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    
    // 当前断点
    current,
    
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    
    // 工具函数
    matches,
    between,
    smaller,
    
    // 断点配置
    breakpoints
  }
}