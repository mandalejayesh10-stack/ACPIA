import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module.js'
import { LoggerModule } from './common/logger/logger.module.js'
import { HealthModule } from './health/health.module.js'
import { AuthModule } from './auth/auth.module.js'

@Module({
  imports: [ConfigModule, LoggerModule, HealthModule, AuthModule],
})
export class AppModule {}
