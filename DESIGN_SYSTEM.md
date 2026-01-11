# CLIProxyAPIPanel 设计系统 v2.3

> 基于 shadcn/ui 和书本纸张主题的完整前端设计规范

**版本**: 2.3.0
**最后更新**: 2025-01-11
**基于**: Aether 设计系统 v2.3

---

## 概述

本文档描述了 CLIProxyAPIPanel 前端项目的设计系统，基于 shadcn/ui 和自定义主题构建。所有组件均已实现并在生产环境中使用。

### 核心理念

1. **一致性优先** - 所有组件遵循统一的视觉语言和交互模式
2. **响应式设计** - 组件自适应不同屏幕尺寸（移动端、平板、桌面）
3. **可访问性** - 遵循 WCAG 2.1 标准，支持键盘导航和屏幕阅读器
4. **性能优化** - 轻量级组件，按需加载，优化渲染性能
5. **开发体验** - TypeScript 类型安全，清晰的 API 设计，完善的文档

### 色彩体系

项目使用书本纸张主题色：

- **book-cloth** - 书籍封面布料色 (#cc785c / #d4a27f)
- **kraft** - 牛皮纸色 (#b97847 / #c9a26f)
- **manilla** - 马尼拉纸色 (#e8ddc5 / #d4c5a9)
- **cloud** - 云白色 (#f5f3ed / #2a2723)

详细配置见 [src/config/theme.ts](src/config/theme.ts)

---

## 技术栈

- **Vue 3** - Composition API
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **shadcn/ui** - 基础组件库
- **lucide-vue-next** - 图标库
- **Vite** - 构建工具

---

## 主题系统

### 主题配置

主题配置位于 [src/config/theme.ts](src/config/theme.ts)，包含：

```ts
export const theme = {
  colors: themeColors,      // 颜色系统
  spacing,                  // 间距系统（基于 8px 网格）
  radius,                   // 圆角系统
  shadows,                  // 阴影系统
  typography,               // 字体系统
  animations,               // 动画系统
  breakpoints,              // 响应式断点
  zIndex,                   // 层级管理
  components: componentDefaults  // 组件默认配置
}
```

### CSS 变量

全局 CSS 变量定义在 `src/style.css`，使用 HSL 色彩空间：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --primary: 15 55% 58%;
  --border: 20 5.9% 90%;
  --muted: 60 4.8% 95.9%;
  --muted-foreground: 25 5.3% 44.7%;
  /* ... 更多变量 */
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 0 0% 95%;
  --primary: 15 45% 68%;
  /* ... 暗色模式变量 */
}
```

---

## 组件库

### 基础组件 (shadcn/ui)

所有基础组件位于 [src/components/ui/](src/components/ui/)：

#### 布局组件
- **Card** - 卡片容器
  - 变体：`default`、`outline`、`ghost`、`interactive`
- **Separator** - 分隔线（水平/垂直）
- **Tabs** - 选项卡容器

#### 表单组件
- **Button** - 按钮
  - 变体：`default`、`destructive`、`outline`、`secondary`、`ghost`、`link`
  - 大小：`sm`、`md`、`lg`、`icon`
- **Input** - 输入框
- **Textarea** - 多行文本框
- **Select** - 下拉选择框
- **Checkbox** - 复选框
- **Switch** - 开关
- **Label** - 表单标签

#### 反馈组件
- **Badge** - 徽章标签
- **Skeleton** - 骨架屏
- **Toast** - 消息提示
- **Dialog** - 对话框/模态框
- **Alert** - 警告提示

#### 数据展示
- **Table** 系列 - 表格组件
  - Table、TableHeader、TableBody、TableRow、TableHead、TableCell
- **Avatar** - 头像
- **Progress** - 进度条

---

### 布局组件 (Layout Components)

位于 [src/components/layout/](src/components/layout/)，所有组件支持从 `@/components/layout` 统一导入：

```ts
import { PageHeader, PageContainer, Section, CardSection } from '@/components/layout'
```

#### PageHeader

页面头部组件，支持标题、描述、图标和操作按钮。

**使用示例：**

```vue
<script setup lang="ts">
import { PageHeader } from '@/components/layout'
import { Settings } from 'lucide-vue-next'
</script>

<template>
  <PageHeader
    title="系统设置"
    description="管理系统级别的配置和参数"
    :icon="Settings"
  >
    <template #actions>
      <Button @click="save">保存配置</Button>
    </template>
  </PageHeader>
</template>
```

**Props:**
- `title: string` - 页面标题(必填)
- `description?: string` - 页面描述
- `icon?: Component` - 图标组件

**Slots:**
- `icon` - 自定义图标区域
- `actions` - 右侧操作按钮

---

## 工具函数 (Composables)

位于 [src/composables/](src/composables/)

### useToast

消息提示管理，统一的 Toast 通知接口。

```ts
import { useToast } from '@/composables/useToast'

const { success, error, warning, info } = useToast()

// 成功消息（5秒后自动消失）
success('操作成功')
success('数据保存成功', '提示')

// 错误消息（8秒后自动消失）
error('操作失败')
error('保存失败，请检查网络连接', '错误')

// 警告消息（8秒后自动消失）
warning('该操作可能影响其他数据', '警告')

// 信息消息（5秒后自动消失）
info('系统将在 5 分钟后进行维护', '系统通知')
```

### useConfirm

确认对话框，用于危险操作确认。

```ts
import { useConfirm } from '@/composables/useConfirm'

const { confirm, confirmDanger, confirmWarning } = useConfirm()

// 普通确认
const ok = await confirm('确定要删除吗？', '确认删除')
if (ok) {
  await deleteItem()
}

// 危险操作确认（红色按钮）
const ok = await confirmDanger(
  '此操作不可撤销，确定继续吗？',
  '删除确认'
)

// 警告确认（黄色主题）
const ok = await confirmWarning(
  '该操作可能影响其他用户，是否继续？',
  '警告'
)
```

---

## 最佳实践

### 1. 组件开发规范

#### 使用 TypeScript

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items?: string[]
}

interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

const emit = defineEmits<Emits>()
</script>
```

#### 遵循命名规范

- **组件文件**: PascalCase （如 `UserCard.vue`、`DataTable.vue`）
- **Composables**: camelCase + `use` 前缀 （如 `useAuth.ts`、`useBreakpoints.ts`）
- **工具函数**: camelCase （如 `formatDate.ts`、`validateEmail.ts`）
- **常量**: SCREAMING_SNAKE_CASE （如 `API_BASE_URL`、`MAX_FILE_SIZE`）

### 2. 样式规范

#### 优先使用 Tailwind 类

```vue
<template>
  <div class="flex items-center gap-4 p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
    <Avatar :src="user.avatar" />
    <div class="flex-1 min-w-0">
      <h3 class="text-lg font-semibold truncate">{{ user.name }}</h3>
      <p class="text-sm text-muted-foreground">{{ user.role }}</p>
    </div>
    <Badge :variant="user.active ? 'success' : 'neutral'">
      {{ user.active ? '在线' : '离线' }}
    </Badge>
  </div>
</template>
```

#### 使用主题 CSS 变量

```vue
<template>
  <div class="custom-card">
    <!-- 内容 -->
  </div>
</template>

<style scoped>
.custom-card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.custom-card:hover {
  background-color: hsl(var(--muted));
}
</style>
```

---

## 更新日志

### v2.3.0 (2025-01-11)

**基于 Aether 设计系统:**
- 完整迁移 Aether 的设计系统到 CLIProxyAPIPanel
- 创建主题配置系统 (theme.ts)
- 统一组件库和工具函数
- 完善设计系统文档

**技术栈:**
- Vue 3 + TypeScript + Tailwind CSS
- shadcn/ui 组件库
- 书本纸张主题色系统

---

## 参考资源

- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vue 3 文档](https://vuejs.org/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 标准](https://www.w3.org/WAI/WCAG21/quickref/)
- [主题配置文件](src/config/theme.ts)