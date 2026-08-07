import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module.js'
import { LoggerModule } from './common/logger/logger.module.js'
import { DatabaseModule } from './common/database/database.module.js'
import { GraphModule } from './common/graph/graph.module.js'
import { VectorModule } from './common/vector/vector.module.js'
import { RedisModule } from './common/redis/redis.module.js'
import { EventBusModule } from './common/events/event-bus.module.js'
import { StorageModule } from './common/storage/storage.module.js'
import { SharedMemoryModule } from './common/memory/shared-memory.module.js'
import { ObservabilityModule } from './common/observability/observability.module.js'
import { HealthModule } from './health/health.module.js'
import { AuthModule } from './auth/auth.module.js'
import { EvidenceModule } from './evidence/evidence.module.js'
import { OrchestratorModule } from './orchestrator/orchestrator.module.js'

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    GraphModule,
    VectorModule,
    RedisModule,
    EventBusModule,
    StorageModule,
    SharedMemoryModule,
    ObservabilityModule,
    HealthModule,
    AuthModule,
    EvidenceModule,
    OrchestratorModule,
  ],
})
export class AppModule {}
