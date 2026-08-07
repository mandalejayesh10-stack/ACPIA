import { Module, Global } from '@nestjs/common'
import { ObservabilityService } from './observability.service.js'
import { ObservabilityController } from './observability.controller.js'

@Global()
@Module({
  controllers: [ObservabilityController],
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
