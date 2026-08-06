/**
 * @acpia/prompt-registry
 *
 * The ACPIA Prompt Registry.
 * All AI prompts are registered, versioned, and retrieved through this package.
 *
 * ARCHITECTURE RULE (PROMPT_REGISTRY.md):
 * - No prompt string may appear in application code
 * - All prompts are stored in PostgreSQL with version tracking
 * - Prompts are accessed via promptRegistry.get(promptId, variables)
 * - Prompt changes require version bump + evaluation suite pass
 *
 * Initialized: Sprint 0.2
 * Implemented: Sprint 16
 *
 * @see docs/PROMPT_REGISTRY.md
 */
export {}
