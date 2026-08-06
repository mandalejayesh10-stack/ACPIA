/**
 * @acpia/agent-sdk
 *
 * The ACPIA Agent Plugin SDK.
 * All 16 investigation agents implement the AgentPlugin interface from this package.
 *
 * ARCHITECTURE RULE (AGENT_CONTRACT.md):
 * - No agent may import any other agent directly
 * - No agent may import database drivers
 * - No agent may call AI SDKs directly (use @acpia/ai-provider)
 * - All agents communicate via Event Bus and MCP servers only
 *
 * Initialized: Sprint 0.2
 * Implemented: Sprint 14
 *
 * @see docs/AGENT_CONTRACT.md
 * @see docs/AGENT_STATE_MACHINE.md
 */
export {}
