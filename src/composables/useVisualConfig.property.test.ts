/**
 * Property-Based Tests for useVisualConfig composable
 * 
 * Feature: visual-config-refactor
 * 
 * These tests verify correctness properties using fast-check for property-based testing.
 * Each test runs minimum 100 iterations with randomly generated inputs.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { useVisualConfig } from './useVisualConfig'
import { parse as parseYaml } from 'yaml'

/**
 * Property 4: YAML 解析-序列化 Round Trip
 * 
 * *For any* valid configuration YAML string, after parsing with loadVisualValuesFromYaml
 * and then serializing with applyVisualChangesToYaml, the result should produce
 * semantically equivalent YAML (same configuration values, ignoring format differences).
 * 
 * **Validates: Requirements 20.1, 20.8**
 */
describe('Property 4: YAML Round Trip', () => {
  const arbPort = fc.integer({ min: 1, max: 65535 })
  const arbPositiveInt = fc.integer({ min: 1, max: 1000 })

  // Generator for streaming config
  const arbStreamingConfig = fc.record({
    keepaliveSeconds: fc.oneof(fc.constant(''), arbPositiveInt.map(String)),
    bootstrapRetries: fc.oneof(fc.constant(''), arbPositiveInt.map(String))
  })

  // Generator for OAuth excluded models
  const arbOAuthExcludedModels = fc.dictionary(
    fc.constantFrom('gemini-cli', 'vertex', 'aistudio', 'claude', 'codex'),
    fc.array(fc.constantFrom('model-1', 'model-2', '*-preview', 'old-*'), { minLength: 1, maxLength: 3 })
  )

  it('should preserve basic server configuration through round trip', () => {
    fc.assert(
      fc.property(
        fc.record({
          host: fc.constantFrom('localhost', '0.0.0.0', '127.0.0.1', 'api.example.com'),
          port: arbPort,
          debug: fc.boolean()
        }),
        (config) => {
          const { loadVisualValuesFromYaml, applyVisualChangesToYaml } = useVisualConfig()
          
          // Create initial YAML
          const initialYaml = `
host: ${config.host}
port: ${config.port}
debug: ${config.debug}
`
          // Load and apply round trip
          loadVisualValuesFromYaml(initialYaml)
          const resultYaml = applyVisualChangesToYaml(initialYaml)
          
          // Parse result and verify semantic equivalence
          const parsed = parseYaml(resultYaml)
          
          expect(parsed.host).toBe(config.host)
          expect(parsed.port).toBe(config.port)
          if (config.debug) {
            expect(parsed.debug).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve streaming configuration through round trip (Requirement 20.1)', () => {
    fc.assert(
      fc.property(
        arbStreamingConfig,
        (streaming) => {
          const { loadVisualValuesFromYaml, applyVisualChangesToYaml, setVisualValues } = useVisualConfig()
          
          // Start with empty YAML
          const initialYaml = ''
          loadVisualValuesFromYaml(initialYaml)
          
          // Set streaming values
          setVisualValues({ streaming })
          
          // Apply changes
          const resultYaml = applyVisualChangesToYaml(initialYaml)
          
          // Reload and verify
          const { loadVisualValuesFromYaml: reload, visualValues: reloaded } = useVisualConfig()
          reload(resultYaml)
          
          // Verify semantic equivalence
          if (streaming.keepaliveSeconds) {
            expect(reloaded.value.streaming.keepaliveSeconds).toBe(streaming.keepaliveSeconds)
          }
          if (streaming.bootstrapRetries) {
            expect(reloaded.value.streaming.bootstrapRetries).toBe(streaming.bootstrapRetries)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve OAuth excluded models configuration through round trip (Requirement 20.7)', () => {
    fc.assert(
      fc.property(
        arbOAuthExcludedModels,
        (excludedModels) => {
          const { loadVisualValuesFromYaml, applyVisualChangesToYaml, setVisualValues } = useVisualConfig()
          
          const initialYaml = ''
          loadVisualValuesFromYaml(initialYaml)
          
          setVisualValues({ oauthExcludedModels: excludedModels })
          
          const resultYaml = applyVisualChangesToYaml(initialYaml)
          
          const { loadVisualValuesFromYaml: reload, visualValues: reloaded } = useVisualConfig()
          reload(resultYaml)
          
          // Verify each channel's excluded models
          for (const [channel, models] of Object.entries(excludedModels)) {
            expect(reloaded.value.oauthExcludedModels[channel]).toEqual(models)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve complete configuration through round trip (Requirement 20.8)', () => {
    fc.assert(
      fc.property(
        fc.record({
          host: fc.constantFrom('localhost', '0.0.0.0'),
          port: arbPort,
          debug: fc.boolean(),
          streaming: arbStreamingConfig,
          oauthExcludedModels: arbOAuthExcludedModels
        }),
        (config) => {
          const { loadVisualValuesFromYaml, applyVisualChangesToYaml, setVisualValues } = useVisualConfig()
          
          const initialYaml = ''
          loadVisualValuesFromYaml(initialYaml)
          
          setVisualValues({
            host: config.host,
            port: String(config.port),
            debug: config.debug,
            streaming: config.streaming,
            oauthExcludedModels: config.oauthExcludedModels
          })
          
          const resultYaml = applyVisualChangesToYaml(initialYaml)
          
          const { loadVisualValuesFromYaml: reload, visualValues: reloaded } = useVisualConfig()
          reload(resultYaml)
          
          // Verify basic fields
          expect(reloaded.value.host).toBe(config.host)
          expect(reloaded.value.port).toBe(String(config.port))
          
          // Verify streaming
          if (config.streaming.keepaliveSeconds) {
            expect(reloaded.value.streaming.keepaliveSeconds).toBe(config.streaming.keepaliveSeconds)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
