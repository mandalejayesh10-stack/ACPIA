import { Module } from '@nestjs/common'
import { OrchestratorController } from './orchestrator.controller.js'
import { OrchestratorService } from './orchestrator.service.js'

@Module({
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
