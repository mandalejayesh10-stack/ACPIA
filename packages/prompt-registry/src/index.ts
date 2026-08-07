/**
 * @acpia/prompt-registry — Versioned Prompt Registry
 * Governed by docs/PROMPT_REGISTRY.md
 */

import { SYSTEM_PROMPTS } from './prompts.js'

export interface PromptDefinition {
  id: string
  version: string
  systemPrompt: string
  userPromptTemplate: string
  model: string
  temperature: number
}

export class PromptRegistry {
  private readonly registry = new Map<string, PromptDefinition>()

  constructor() {
    // Pre-register default investigation system prompts
    for (const prompt of SYSTEM_PROMPTS) {
      this.register(prompt)
    }
  }

  register(prompt: PromptDefinition): void {
    this.registry.set(prompt.id, prompt)
  }

  get(promptId: string): PromptDefinition | undefined {
    return this.registry.get(promptId)
  }

  list(): PromptDefinition[] {
    return Array.from(this.registry.values())
  }

  render(promptId: string, variables: Record<string, unknown>): string {
    const prompt = this.get(promptId)
    if (!prompt) {
      throw new Error(`Prompt '${promptId}' not registered in PromptRegistry.`)
    }

    let rendered = prompt.userPromptTemplate
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value))
    }
    return rendered
  }
}

export const defaultPromptRegistry = new PromptRegistry()
export * from './prompts.js'
