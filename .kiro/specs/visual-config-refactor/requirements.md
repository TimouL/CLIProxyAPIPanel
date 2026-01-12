# Requirements Document

## Introduction

本规范定义了 CLIProxyAPIPanel 项目中可视化配置编辑器（VisualConfigEditor）的重构需求。当前实现将所有配置项放在一个单一的 Vue 组件中，需要将其拆分为多个独立的子组件，并完成剩余未实现的配置项可视化。

## Glossary

- **Visual_Config_Editor**: 可视化配置编辑器主组件，负责协调各子组件
- **Config_Section**: 配置区块容器组件，提供统一的卡片样式
- **Server_Config**: 服务器基础配置组件（host、port）
- **TLS_Config**: TLS/SSL 安全连接配置组件
- **Remote_Management_Config**: 远程管理配置组件
- **Auth_Config**: 认证配置组件（auth-dir、api-keys）
- **System_Config**: 系统配置组件（debug、logging 等）
- **Network_Config**: 网络配置组件（proxy、retry、routing）
- **Quota_Config**: 配额回退配置组件
- **Streaming_Config**: 流式传输配置组件（keepalive、bootstrap-retries）
- **Gemini_API_Config**: Gemini API 密钥配置组件
- **Codex_API_Config**: Codex API 密钥配置组件
- **Claude_API_Config**: Claude API 密钥配置组件
- **OpenAI_Compatibility_Config**: OpenAI 兼容提供商配置组件
- **Vertex_API_Config**: Vertex API 密钥配置组件
- **Ampcode_Config**: Amp 集成配置组件
- **OAuth_Model_Mappings_Config**: OAuth 模型映射配置组件
- **OAuth_Excluded_Models_Config**: OAuth 排除模型配置组件
- **Payload_Config**: Payload 配置组件

## Requirements

### Requirement 1: 组件拆分架构

**User Story:** 作为开发者，我希望将可视化配置编辑器拆分为独立的子组件，以便于维护和扩展。

#### Acceptance Criteria

1. THE Visual_Config_Editor SHALL 作为主容器组件，负责协调所有子组件
2. WHEN 配置值发生变化时，THE Visual_Config_Editor SHALL 通过 emit 事件通知父组件
3. THE Visual_Config_Editor SHALL 将配置值通过 props 传递给各子组件
4. WHEN 子组件更新配置值时，THE Visual_Config_Editor SHALL 合并更新并触发 update:values 事件

### Requirement 2: 服务器配置组件

**User Story:** 作为用户，我希望在独立的组件中配置服务器基础设置。

#### Acceptance Criteria

1. THE Server_Config SHALL 提供 host 输入框，支持绑定主机地址
2. THE Server_Config SHALL 提供 port 输入框，支持数字类型输入
3. WHEN host 或 port 值变化时，THE Server_Config SHALL 触发 update 事件

### Requirement 3: TLS 配置组件

**User Story:** 作为用户，我希望在独立的组件中配置 TLS/SSL 设置。

#### Acceptance Criteria

1. THE TLS_Config SHALL 提供启用 TLS 的开关
2. WHEN TLS 启用时，THE TLS_Config SHALL 显示证书和私钥路径输入框
3. WHEN TLS 禁用时，THE TLS_Config SHALL 隐藏证书和私钥输入框

### Requirement 4: 远程管理配置组件

**User Story:** 作为用户，我希望在独立的组件中配置远程管理设置。

#### Acceptance Criteria

1. THE Remote_Management_Config SHALL 提供允许远程访问的开关
2. THE Remote_Management_Config SHALL 提供禁用控制面板的开关
3. THE Remote_Management_Config SHALL 提供管理密钥输入框（密码类型）
4. THE Remote_Management_Config SHALL 提供面板仓库地址输入框

### Requirement 5: 认证配置组件

**User Story:** 作为用户，我希望在独立的组件中配置认证设置。

#### Acceptance Criteria

1. THE Auth_Config SHALL 提供认证文件目录输入框
2. THE Auth_Config SHALL 提供 API 密钥列表文本域，支持每行一个密钥

### Requirement 6: 系统配置组件

**User Story:** 作为用户，我希望在独立的组件中配置系统设置。

#### Acceptance Criteria

1. THE System_Config SHALL 提供调试模式开关
2. THE System_Config SHALL 提供商业模式开关
3. THE System_Config SHALL 提供写入日志文件开关
4. THE System_Config SHALL 提供使用统计开关
5. THE System_Config SHALL 提供日志文件大小限制输入框

### Requirement 7: 网络配置组件

**User Story:** 作为用户，我希望在独立的组件中配置网络设置。

#### Acceptance Criteria

1. THE Network_Config SHALL 提供代理 URL 输入框
2. THE Network_Config SHALL 提供请求重试次数输入框
3. THE Network_Config SHALL 提供最大重试间隔输入框
4. THE Network_Config SHALL 提供路由策略选择器（round-robin/fill-first）
5. THE Network_Config SHALL 提供强制模型前缀开关
6. THE Network_Config SHALL 提供 WebSocket 认证开关

### Requirement 8: 配额回退配置组件

**User Story:** 作为用户，我希望在独立的组件中配置配额回退策略。

#### Acceptance Criteria

1. THE Quota_Config SHALL 提供切换项目开关
2. THE Quota_Config SHALL 提供切换预览模型开关

### Requirement 9: 流式传输配置组件（新增）

**User Story:** 作为用户，我希望配置流式传输的 keepalive 和重试设置。

#### Acceptance Criteria

1. THE Streaming_Config SHALL 提供 keepalive-seconds 输入框
2. THE Streaming_Config SHALL 提供 bootstrap-retries 输入框
3. WHEN keepalive-seconds 为 0 或空时，THE Streaming_Config SHALL 显示"已禁用"提示

### Requirement 10: Gemini API 配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 Gemini API 密钥。

#### Acceptance Criteria

1. THE Gemini_API_Config SHALL 支持添加多个 API 密钥条目
2. THE Gemini_API_Config SHALL 为每个条目提供 api-key 输入框
3. THE Gemini_API_Config SHALL 为每个条目提供可选的 prefix 输入框
4. THE Gemini_API_Config SHALL 为每个条目提供可选的 base-url 输入框
5. THE Gemini_API_Config SHALL 为每个条目提供可选的 proxy-url 输入框
6. THE Gemini_API_Config SHALL 为每个条目提供可选的 headers 键值对编辑器
7. THE Gemini_API_Config SHALL 为每个条目提供可选的 models 映射列表（name/alias）
8. THE Gemini_API_Config SHALL 为每个条目提供可选的 excluded-models 列表
9. THE Gemini_API_Config SHALL 支持删除已添加的条目

### Requirement 11: Codex API 配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 Codex API 密钥。

#### Acceptance Criteria

1. THE Codex_API_Config SHALL 支持添加多个 API 密钥条目
2. THE Codex_API_Config SHALL 为每个条目提供与 Gemini_API_Config 相同的配置字段
3. THE Codex_API_Config SHALL 支持删除已添加的条目

### Requirement 12: Claude API 配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 Claude API 密钥。

#### Acceptance Criteria

1. THE Claude_API_Config SHALL 支持添加多个 API 密钥条目
2. THE Claude_API_Config SHALL 为每个条目提供与 Gemini_API_Config 相同的配置字段
3. THE Claude_API_Config SHALL 支持删除已添加的条目

### Requirement 13: OpenAI 兼容提供商配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 OpenAI 兼容的第三方提供商。

#### Acceptance Criteria

1. THE OpenAI_Compatibility_Config SHALL 支持添加多个提供商条目
2. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供 name 输入框
3. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供可选的 prefix 输入框
4. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供 base-url 输入框
5. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供可选的 headers 键值对编辑器
6. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供 api-key-entries 列表，每个条目包含 api-key 和可选的 proxy-url
7. THE OpenAI_Compatibility_Config SHALL 为每个提供商提供可选的 models 映射列表（name/alias）
8. THE OpenAI_Compatibility_Config SHALL 支持删除已添加的提供商

### Requirement 14: Vertex API 配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 Vertex API 密钥。

#### Acceptance Criteria

1. THE Vertex_API_Config SHALL 支持添加多个 API 密钥条目
2. THE Vertex_API_Config SHALL 为每个条目提供与 Gemini_API_Config 相同的配置字段
3. THE Vertex_API_Config SHALL 支持删除已添加的条目

### Requirement 15: Ampcode 配置组件（新增）

**User Story:** 作为用户，我希望可视化配置 Amp 集成设置。

#### Acceptance Criteria

1. THE Ampcode_Config SHALL 提供 upstream-url 输入框
2. THE Ampcode_Config SHALL 提供 upstream-api-key 输入框
3. THE Ampcode_Config SHALL 提供 restrict-management-to-localhost 开关
4. THE Ampcode_Config SHALL 提供 force-model-mappings 开关
5. THE Ampcode_Config SHALL 提供 model-mappings 列表编辑器（from/to 映射）
6. THE Ampcode_Config SHALL 提供 upstream-api-keys 映射编辑器，支持将客户端 API 密钥映射到不同的上游密钥

### Requirement 16: OAuth 模型映射配置组件（新增）

**User Story:** 作为用户，我希望可视化配置各渠道的 OAuth 模型名称映射。

#### Acceptance Criteria

1. THE OAuth_Model_Mappings_Config SHALL 支持配置多个渠道（gemini-cli、vertex、aistudio、antigravity、claude、codex、qwen、iflow）
2. THE OAuth_Model_Mappings_Config SHALL 为每个渠道提供模型映射列表
3. THE OAuth_Model_Mappings_Config SHALL 为每个映射提供 name（原始模型名）输入框
4. THE OAuth_Model_Mappings_Config SHALL 为每个映射提供 alias（别名）输入框
5. THE OAuth_Model_Mappings_Config SHALL 为每个映射提供 fork 开关（保留原始并添加别名）

### Requirement 17: OAuth 排除模型配置组件（新增）

**User Story:** 作为用户，我希望可视化配置各渠道的排除模型列表。

#### Acceptance Criteria

1. THE OAuth_Excluded_Models_Config SHALL 支持配置多个渠道
2. THE OAuth_Excluded_Models_Config SHALL 为每个渠道提供排除模型列表
3. THE OAuth_Excluded_Models_Config SHALL 支持通配符模式（如 gemini-2.5-*、*-preview）

### Requirement 18: Payload 配置组件

**User Story:** 作为用户，我希望可视化配置请求 payload 的默认值和覆盖规则。

#### Acceptance Criteria

1. THE Payload_Config SHALL 分别提供 default 和 override 规则编辑器
2. THE Payload_Config SHALL 为每条规则提供 models 列表（支持 name 和可选的 protocol）
3. THE Payload_Config SHALL 为每条规则提供 params 键值对编辑器（JSON path -> value）
4. THE Payload_Config SHALL 支持 params 值的类型选择（string、number、boolean、json）

### Requirement 19: 类型定义扩展

**User Story:** 作为开发者，我希望类型定义能覆盖所有新增的配置项。

#### Acceptance Criteria

1. THE VisualConfigValues 类型 SHALL 包含 streaming 配置字段
2. THE VisualConfigValues 类型 SHALL 包含 geminiApiKeys 配置字段
3. THE VisualConfigValues 类型 SHALL 包含 codexApiKeys 配置字段
4. THE VisualConfigValues 类型 SHALL 包含 claudeApiKeys 配置字段
5. THE VisualConfigValues 类型 SHALL 包含 openaiCompatibility 配置字段
6. THE VisualConfigValues 类型 SHALL 包含 vertexApiKeys 配置字段
7. THE VisualConfigValues 类型 SHALL 包含 oauthExcludedModels 配置字段
8. THE VisualConfigValues 类型 SHALL 包含 ampUpstreamApiKeys 配置字段

### Requirement 20: Composable 更新

**User Story:** 作为开发者，我希望 useVisualConfig composable 能正确解析和序列化所有新增配置项。

#### Acceptance Criteria

1. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 streaming 配置
2. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 gemini-api-key 配置
3. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 codex-api-key 配置
4. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 claude-api-key 配置
5. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 openai-compatibility 配置
6. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 vertex-api-key 配置
7. WHEN 加载 YAML 时，THE useVisualConfig SHALL 正确解析 oauth-excluded-models 配置
8. WHEN 应用更改时，THE useVisualConfig SHALL 正确序列化所有配置项回 YAML 格式
