import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

export interface CopilotTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client!: Redis

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://:acpia_redis_password_2026@localhost:6379/0'
    )

    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      })

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis Cache & Ephemeral Memory store')
      })

      this.client.on('error', (err) => {
        this.logger.warn(`Redis standby mode active: ${err.message}`)
      })

      this.client.connect().catch((err) => {
        this.logger.warn(`Redis initial connect failed: ${err.message}`)
      })
    } catch (err) {
      this.logger.warn(`Redis initialization error: ${(err as Error).message}`)
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect()
    }
  }

  // ─── 1. Basic Key-Value Operations ──────────────────────────────────────────
  async get(key: string): Promise<string | null> {
    if (!this.client || this.client.status !== 'ready') return null
    try {
      return await this.client.get(key)
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value)
      } else {
        await this.client.set(key, value)
      }
    } catch (err) {
      this.logger.error(`Redis set failed for key ${key}: ${(err as Error).message}`)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return
    try {
      await this.client.del(key)
    } catch (err) {
      this.logger.error(`Redis del failed for key ${key}: ${(err as Error).message}`)
    }
  }

  // ─── 2. Token Blacklist (Revocation) per SECURITY.md ─────────────────────────
  async blacklistToken(token: string, ttlSeconds: number = 28800): Promise<void> {
    const key = `acpia:blacklist:${token}`
    await this.set(key, 'REVOKED', ttlSeconds)
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `acpia:blacklist:${token}`
    const result = await this.get(key)
    return result === 'REVOKED'
  }

  // ─── 3. Agent Working Memory (Hashes) per INVESTIGATION_STATE.md ─────────────
  async setAgentMemory(caseId: string, agentId: string, memoryJson: string): Promise<void> {
    const key = `acpia:case:${caseId}:agent_memory`
    if (!this.client || this.client.status !== 'ready') return
    try {
      await this.client.hset(key, agentId, memoryJson)
    } catch (err) {
      this.logger.error(`Redis hset failed for case ${caseId}: ${(err as Error).message}`)
    }
  }

  async getAgentMemory(caseId: string, agentId: string): Promise<string | null> {
    const key = `acpia:case:${caseId}:agent_memory`
    if (!this.client || this.client.status !== 'ready') return null
    try {
      return await this.client.hget(key, agentId)
    } catch {
      return null
    }
  }

  // ─── 4. Copilot Session Conversation History (Lists) ────────────────────────
  async pushCopilotTurn(sessionId: string, turn: CopilotTurn): Promise<void> {
    const key = `acpia:session:${sessionId}:history`
    if (!this.client || this.client.status !== 'ready') return
    try {
      await this.client.rpush(key, JSON.stringify(turn))
      // Keep last 50 turns per session
      await this.client.ltrim(key, -50, -1)
      await this.client.expire(key, 1800) // 30 min idle TTL per SECURITY.md
    } catch (err) {
      this.logger.error(`Redis copilot push failed: ${(err as Error).message}`)
    }
  }

  async getCopilotHistory(sessionId: string): Promise<CopilotTurn[]> {
    const key = `acpia:session:${sessionId}:history`
    if (!this.client || this.client.status !== 'ready') return []
    try {
      const items = await this.client.lrange(key, 0, -1)
      return items.map((item) => JSON.parse(item) as CopilotTurn)
    } catch {
      return []
    }
  }
}
