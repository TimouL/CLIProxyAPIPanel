<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold">抽屉组件对比演示</h1>
      <p class="text-muted-foreground">
        对比旧版 Sheet 组件和新版 Drawer 组件的视觉效果和动画
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 旧版 Sheet -->
      <Card class="p-6">
        <div class="space-y-4">
          <div class="text-center space-y-2">
            <h2 class="text-xl font-semibold">旧版 Sheet 组件</h2>
            <p class="text-sm text-muted-foreground">
              基于 Radix Vue 的实现
            </p>
          </div>
          
          <div class="space-y-3">
            <Button @click="showOldSheet = true" class="w-full">
              打开 Sheet 抽屉
            </Button>
            <Button @click="showOldSheetWithIcon = true" variant="outline" class="w-full">
              <Key class="w-4 h-4 mr-2" />
              带图标的 Sheet
            </Button>
          </div>

          <div class="text-xs text-muted-foreground space-y-1">
            <p>• 使用 Radix Vue DialogRoot</p>
            <p>• 标准的滑入动画</p>
            <p>• 固定的动画时长</p>
          </div>
        </div>
      </Card>

      <!-- 新版 Drawer -->
      <Card class="p-6">
        <div class="space-y-4">
          <div class="text-center space-y-2">
            <h2 class="text-xl font-semibold">新版 Drawer 组件</h2>
            <p class="text-sm text-muted-foreground">
              基于 Aether 设计的实现
            </p>
          </div>
          
          <div class="space-y-3">
            <Button @click="showNewDrawer = true" class="w-full">
              打开 Drawer 抽屉
            </Button>
            <Button @click="showNewDrawerWithIcon = true" variant="outline" class="w-full">
              <Key class="w-4 h-4 mr-2" />
              带图标的 Drawer
            </Button>
          </div>

          <div class="text-xs text-muted-foreground space-y-1">
            <p>• 使用 Vue Transition</p>
            <p>• 更流畅的动画效果</p>
            <p>• 优化的缓动函数</p>
            <p>• 移动端适配</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 功能对比表格 -->
    <Card class="p-6">
      <h3 class="text-lg font-semibold mb-4">功能对比</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left p-2">功能</th>
              <th class="text-center p-2">Sheet</th>
              <th class="text-center p-2">Drawer</th>
              <th class="text-left p-2">说明</th>
            </tr>
          </thead>
          <tbody class="space-y-2">
            <tr class="border-b">
              <td class="p-2 font-medium">基础功能</td>
              <td class="text-center p-2">✅</td>
              <td class="text-center p-2">✅</td>
              <td class="p-2 text-muted-foreground">标题、描述、内容、底部操作</td>
            </tr>
            <tr class="border-b">
              <td class="p-2 font-medium">动画效果</td>
              <td class="text-center p-2">⭐⭐⭐</td>
              <td class="text-center p-2">⭐⭐⭐⭐⭐</td>
              <td class="p-2 text-muted-foreground">Drawer 有更流畅的动画</td>
            </tr>
            <tr class="border-b">
              <td class="p-2 font-medium">移动端适配</td>
              <td class="text-center p-2">⭐⭐⭐</td>
              <td class="text-center p-2">⭐⭐⭐⭐⭐</td>
              <td class="p-2 text-muted-foreground">Drawer 支持底部滑入</td>
            </tr>
            <tr class="border-b">
              <td class="p-2 font-medium">ESC 键支持</td>
              <td class="text-center p-2">❌</td>
              <td class="text-center p-2">✅</td>
              <td class="p-2 text-muted-foreground">Drawer 内置 ESC 键监听</td>
            </tr>
            <tr class="border-b">
              <td class="p-2 font-medium">防误关闭</td>
              <td class="text-center p-2">❌</td>
              <td class="text-center p-2">✅</td>
              <td class="p-2 text-muted-foreground">Drawer 支持 persistent 属性</td>
            </tr>
            <tr class="border-b">
              <td class="p-2 font-medium">依赖大小</td>
              <td class="text-center p-2">⭐⭐⭐</td>
              <td class="text-center p-2">⭐⭐⭐⭐⭐</td>
              <td class="p-2 text-muted-foreground">Drawer 无需 Radix 依赖</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>

  <!-- 旧版 Sheet 演示 -->
  <Sheet 
    :open="showOldSheet" 
    @update:open="showOldSheet = $event" 
    size="md"
    title="旧版 Sheet 组件"
    description="这是使用 Radix Vue 实现的 Sheet 组件"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        这是旧版的 Sheet 组件，使用 Radix Vue 的 DialogRoot 实现。
      </p>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-2">示例输入框</label>
          <Input placeholder="输入一些内容..." />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">选择器</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择一个选项" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">选项 1</SelectItem>
              <SelectItem value="option2">选项 2</SelectItem>
              <SelectItem value="option3">选项 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button @click="showOldSheet = false">确定</Button>
      <Button variant="outline" @click="showOldSheet = false">取消</Button>
    </template>
  </Sheet>

  <!-- 带图标的旧版 Sheet -->
  <Sheet 
    :open="showOldSheetWithIcon" 
    @update:open="showOldSheetWithIcon = $event" 
    size="lg"
    title="API 密钥管理"
    description="管理您的 API 访问密钥"
    :icon="Key"
  >
    <div class="space-y-6">
      <div class="bg-muted/50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">安全提示</h4>
        <p class="text-sm text-muted-foreground">
          请妥善保管您的 API 密钥，不要在公开场所分享。
        </p>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">API 密钥名称</label>
          <Input placeholder="输入密钥名称..." />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">权限范围</label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="read" />
              <label for="read" class="text-sm">读取权限</label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="write" />
              <label for="write" class="text-sm">写入权限</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button @click="showOldSheetWithIcon = false">创建密钥</Button>
      <Button variant="outline" @click="showOldSheetWithIcon = false">取消</Button>
    </template>
  </Sheet>

  <!-- 新版 Drawer 演示 -->
  <Drawer 
    :open="showNewDrawer" 
    @update:open="showNewDrawer = $event" 
    size="md"
    title="新版 Drawer 组件"
    description="这是基于 Aether 设计的 Drawer 组件"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        这是新版的 Drawer 组件，具有更优雅的动画效果和更好的用户体验。
      </p>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium mb-2">示例输入框</label>
          <Input placeholder="输入一些内容..." />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">选择器</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择一个选项" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">选项 1</SelectItem>
              <SelectItem value="option2">选项 2</SelectItem>
              <SelectItem value="option3">选项 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button @click="showNewDrawer = false">确定</Button>
      <Button variant="outline" @click="showNewDrawer = false">取消</Button>
    </template>
  </Drawer>

  <!-- 带图标的新版 Drawer -->
  <Drawer 
    :open="showNewDrawerWithIcon" 
    @update:open="showNewDrawerWithIcon = $event" 
    size="lg"
    title="API 密钥管理"
    description="管理您的 API 访问密钥"
    :icon="Key"
  >
    <div class="space-y-6">
      <div class="bg-muted/50 p-4 rounded-lg border border-border/50">
        <h4 class="font-medium mb-2 flex items-center gap-2">
          <Shield class="w-4 h-4 text-primary" />
          安全提示
        </h4>
        <p class="text-sm text-muted-foreground">
          请妥善保管您的 API 密钥，不要在公开场所分享。
        </p>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">API 密钥名称</label>
          <Input placeholder="输入密钥名称..." />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">权限范围</label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="read2" />
              <label for="read2" class="text-sm">读取权限</label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="write2" />
              <label for="write2" class="text-sm">写入权限</label>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">过期时间</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择过期时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 天</SelectItem>
              <SelectItem value="90d">90 天</SelectItem>
              <SelectItem value="1y">1 年</SelectItem>
              <SelectItem value="never">永不过期</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button @click="showNewDrawerWithIcon = false">创建密钥</Button>
      <Button variant="outline" @click="showNewDrawerWithIcon = false">取消</Button>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Checkbox,
  Sheet,
  Drawer
} from '@/components/ui'
import { Key, Shield } from 'lucide-vue-next'

// 控制各个抽屉的显示状态
const showOldSheet = ref(false)
const showOldSheetWithIcon = ref(false)
const showNewDrawer = ref(false)
const showNewDrawerWithIcon = ref(false)
</script>