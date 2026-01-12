# Implementation Plan: Visual Config Editor Refactor

## Overview

将 VisualConfigEditor 组件拆分为多个独立子组件，并完成所有配置项的可视化实现。采用渐进式重构策略，先创建基础设施，再逐步迁移和新增组件。

## Tasks

- [x] 1. 扩展类型定义
  - [x] 1.1 更新 VisualConfigValues 类型，添加新配置字段
    - 添加 StreamingConfig、ApiKeyEntry、OpenAICompatibilityEntry 等类型
    - 添加 geminiApiKeys、codexApiKeys、claudeApiKeys、vertexApiKeys 字段
    - 添加 openaiCompatibility、ampUpstreamApiKeys、oauthExcludedModels 字段
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8_

- [x] 2. 创建可复用编辑器组件
  - [x] 2.1 创建 KeyValueEditor.vue 组件
    - 支持动态添加/删除键值对
    - 支持自定义 placeholder
    - _Requirements: 10.6, 13.5, 15.6_
  - [x] 2.2 创建 ModelMappingEditor.vue 组件
    - 支持 name/alias 映射编辑
    - 支持动态添加/删除映射
    - _Requirements: 10.7, 13.7_
  - [x] 2.3 创建 StringListEditor.vue 组件
    - 支持字符串列表编辑
    - 支持通配符模式输入
    - _Requirements: 10.8, 17.2, 17.3_
  - [x] 2.4 创建 ApiKeyEntryEditor.vue 组件
    - 封装单个 API 密钥条目的编辑界面
    - 包含 apiKey、prefix、baseUrl、proxyUrl、headers、models、excludedModels
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 3. 创建基础配置区块组件
  - [x] 3.1 创建 ServerConfigSection.vue
    - 从 VisualConfigEditor 迁移服务器配置部分
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 3.2 创建 TlsConfigSection.vue
    - 从 VisualConfigEditor 迁移 TLS 配置部分
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 3.3 创建 RemoteManagementSection.vue
    - 从 VisualConfigEditor 迁移远程管理配置部分
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 3.4 创建 AuthConfigSection.vue
    - 从 VisualConfigEditor 迁移认证配置部分
    - _Requirements: 5.1, 5.2_
  - [x] 3.5 创建 SystemConfigSection.vue
    - 从 VisualConfigEditor 迁移系统配置部分
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 3.6 创建 NetworkConfigSection.vue
    - 从 VisualConfigEditor 迁移网络配置部分
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 3.7 创建 QuotaConfigSection.vue
    - 从 VisualConfigEditor 迁移配额回退配置部分
    - _Requirements: 8.1, 8.2_

- [x] 4. Checkpoint - 基础组件完成
  - 确保所有基础配置组件正常工作
  - 确保 VisualConfigEditor 正确集成所有基础组件
  - 如有问题请询问用户

- [x] 5. 创建新增配置区块组件
  - [x] 5.1 创建 StreamingConfigSection.vue
    - 实现 keepalive-seconds 和 bootstrap-retries 配置
    - _Requirements: 9.1, 9.2, 9.3_
  - [x] 5.2 创建 GeminiApiConfigSection.vue
    - 使用 ApiKeyEntryEditor 实现 Gemini API 密钥列表
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_
  - [x] 5.3 创建 CodexApiConfigSection.vue
    - 复用 ApiKeyEntryEditor 实现 Codex API 密钥列表
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 5.4 创建 ClaudeApiConfigSection.vue
    - 复用 ApiKeyEntryEditor 实现 Claude API 密钥列表
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 5.5 创建 VertexApiConfigSection.vue
    - 复用 ApiKeyEntryEditor 实现 Vertex API 密钥列表
    - _Requirements: 14.1, 14.2, 14.3_
  - [x] 5.6 创建 OpenAICompatibilitySection.vue
    - 实现 OpenAI 兼容提供商配置
    - 支持嵌套的 api-key-entries 列表
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [x] 6. Checkpoint - API 配置组件完成
  - 确保所有 API 配置组件正常工作
  - 如有问题请询问用户

- [x] 7. 创建高级配置区块组件
  - [x] 7.1 创建 AmpcodeConfigSection.vue
    - 实现 Ampcode 集成配置
    - 包含 model-mappings 和 upstream-api-keys 编辑
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  - [x] 7.2 创建 OAuthModelMappingsSection.vue
    - 实现多渠道的模型映射配置
    - 支持 fork 选项
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  - [x] 7.3 创建 OAuthExcludedModelsSection.vue
    - 实现多渠道的排除模型配置
    - 支持通配符模式
    - _Requirements: 17.1, 17.2, 17.3_
  - [x] 7.4 创建 PayloadConfigSection.vue
    - 实现 default 和 override 规则编辑
    - 支持 params 值类型选择
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [x] 8. 更新 useVisualConfig composable
  - [x] 8.1 更新 loadVisualValuesFromYaml 函数
    - 添加 streaming 配置解析
    - 添加 gemini-api-key 配置解析
    - 添加 codex-api-key 配置解析
    - 添加 claude-api-key 配置解析
    - 添加 openai-compatibility 配置解析
    - 添加 vertex-api-key 配置解析
    - 添加 oauth-excluded-models 配置解析
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_
  - [x] 8.2 更新 applyVisualChangesToYaml 函数
    - 添加所有新配置项的序列化逻辑
    - _Requirements: 20.8_

- [-] 9. 重构 VisualConfigEditor 主组件
  - [x] 9.1 重构 VisualConfigEditor.vue
    - 移除内联的配置区块代码
    - 导入并使用所有子组件
    - 实现统一的值更新处理
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 10. Checkpoint - 集成完成
  - 确保所有组件正确集成
  - 确保配置的加载和保存正常工作
  - 如有问题请询问用户

- [x] 11. 编写属性测试
  - [x] 11.1 编写 YAML Round Trip 属性测试
    - **Property 4: YAML 解析-序列化 Round Trip**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8**
  - [x] 11.2 编写 API 密钥列表操作属性测试
    - **Property 3: API 密钥列表操作一致性**
    - **Validates: Requirements 10.1, 10.9, 11.1, 11.3, 12.1, 12.3, 14.1, 14.3**

- [x] 12. Final Checkpoint
  - 确保所有测试通过
  - 确保所有配置项可正常编辑和保存
  - 如有问题请询问用户

## Notes

- 每个任务引用了具体的需求以便追溯
- Checkpoint 任务用于增量验证
- 属性测试验证核心正确性属性
