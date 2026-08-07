import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Connect to PostgreSQL when running in active DB mode
    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.$connect()
      } catch {
        // Fallback for offline dev mode before Docker containers are started
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
