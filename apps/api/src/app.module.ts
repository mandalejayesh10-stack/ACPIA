import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration.js'
import { HealthModule } from './health/health.module.js'
import { StructuredLoggerService } from './common/logger/structured-logger.service.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
  ],
  providers: [StructuredLoggerService],
  exports: [StructuredLoggerService],
})
export class AppModule {}
