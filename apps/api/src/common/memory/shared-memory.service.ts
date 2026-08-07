import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import { RedisService } from '../redis/redis.service.js'

export interface MemoryEntity {
  id: string
  type: string
  name: string
  confidence: number
  attributes: Record<string, unknown>
}

export interface CaseMemorySnapshot {
  caseId: string
  entitiesCount: number
  activeThreatsCount: number
  lastUpdated: string
  summary?: string
}

@Injectable()
export class SharedMemoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  // ─── 1. Case State Memory ──────────────────────────────────────────────────
  async getCaseMemory(caseId: string): Promise<CaseMemorySnapshot | null> {
    const cached = await this.redis.get(`acpia:memory:case:${caseId}`)
    if (cached) {
      return JSON.parse(cached)
    }

    const state = await this.prisma.intelligenceState.findUnique({
      where: { caseId },
    })

    if (!state) return null

    const snapshot: CaseMemorySnapshot = {
      caseId,
      entitiesCount: Array.isArray(state.persons) ? state.persons.length : 0,
      activeThreatsCount: Array.isArray(state.activeThreats) ? state.activeThreats.length : 0,
      lastUpdated: state.lastFusedAt.toISOString(),
    }

    await this.redis.set(`acpia:memory:case:${caseId}`, JSON.stringify(snapshot), 300)
    return snapshot
  }

  async setCaseMemory(caseId: string, memory: Record<string, unknown>): Promise<void> {
    const key = `acpia:memory:case:${caseId}`
    await this.redis.set(key, JSON.stringify(memory), 3600)
  }

  // ─── 2. Entity Memory ──────────────────────────────────────────────────────
  async getEntityMemory(caseId: string, entityId: string): Promise<MemoryEntity | null> {
    const cached = await this.redis.getAgentMemory(caseId, `entity:${entityId}`)
    if (cached) {
      return JSON.parse(cached)
    }
    return null
  }

  async upsertEntityMemory(caseId: string, entity: MemoryEntity): Promise<void> {
    await this.redis.setAgentMemory(caseId, `entity:${entity.id}`, JSON.stringify(entity))
  }

  // ─── 3. Evidence Context Memory ───────────────────────────────────────────
  async getEvidenceMemory(evidenceId: string): Promise<Record<string, unknown> | null> {
    const cached = await this.redis.get(`acpia:memory:evidence:${evidenceId}`)
    if (cached) {
      return JSON.parse(cached)
    }

    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    })

    if (!evidence) return null

    const memoryData = {
      id: evidence.id,
      fileName: evidence.fileName,
      mimeType: evidence.mimeType,
      hashSha256: evidence.hashSha256,
      status: evidence.status,
      metadata: evidence.metadata,
    }

    await this.redis.set(`acpia:memory:evidence:${evidenceId}`, JSON.stringify(memoryData), 1800)
    return memoryData
  }

  // ─── 4. Conversation Memory ────────────────────────────────────────────────
  async getConversationMemory(sessionId: string) {
    return this.redis.getCopilotHistory(sessionId)
  }

  async pushConversationTurn(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ) {
    await this.redis.pushCopilotTurn(sessionId, {
      role,
      content,
      timestamp: new Date().toISOString(),
    })
  }
}
