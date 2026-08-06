import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module.js'
import { LoggerModule } from './common/logger/logger.module.js'
import { HealthModule } from './health/health.module.js'

@Module({
  imports: [ConfigModule, LoggerModule, HealthModule],
})
export class AppModule {}
