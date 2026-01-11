/**
 * Amp CLI Integration (ampcode) 配置
 */

export interface AmpcodeModelMapping {
  from: string;
  to: string;
}

export interface AmpcodeConfig {
  // Backend uses kebab-case
  'upstream-url'?: string;
  'upstream-api-key'?: string;
  'model-mappings'?: AmpcodeModelMapping[];
  'force-model-mappings'?: boolean;
  // Legacy camelCase support
  upstreamUrl?: string;
  upstreamApiKey?: string;
  modelMappings?: AmpcodeModelMapping[];
  forceModelMappings?: boolean;
}

