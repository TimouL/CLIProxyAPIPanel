import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // 登录/连接页面
  {
    path: '/login',
    name: 'Connect',
    component: () => import('@/views/ConnectPage.vue'),
    meta: { requiresAuth: false }
  },

  // 主应用路由 - 直接在根路径下
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardPage.vue')
      },
      {
        path: 'api-keys',
        name: 'ApiKeys',
        component: () => import('@/views/ApiKeysPage.vue')
      },
      {
        path: 'ai-providers',
        name: 'AiProviders',
        component: () => import('@/views/AiProvidersPage.vue')
      },
      {
        path: 'auth-files',
        name: 'AuthFiles',
        component: () => import('@/views/AuthFilesPage.vue')
      },
      {
        path: 'oauth',
        name: 'OAuth',
        component: () => import('@/views/OAuthPage.vue')
      },
      {
        path: 'models',
        name: 'Models',
        component: () => import('@/views/ModelsPage.vue')
      },
      {
        path: 'usage',
        name: 'Usage',
        component: () => import('@/views/UsagePage.vue')
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/LogsPage.vue')
      },
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/ConfigPage.vue')
      },
      {
        path: 'backup',
        name: 'Backup',
        component: () => import('@/views/BackupPage.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsPage.vue')
      }
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 如果正在加载中，允许访问任何路由（避免闪烁）
  if (document.querySelector('.splash-screen')) {
    next()
    return
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !authStore.isConnected) {
    // 需要认证但未连接，重定向到连接页面
    next({ name: 'Connect', query: { redirect: to.fullPath } })
  } else if (to.name === 'Connect' && authStore.isConnected) {
    // 已连接但访问连接页面，重定向到仪表盘
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
