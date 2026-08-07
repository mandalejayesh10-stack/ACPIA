import { Module, Global } from '@nestjs/common'
import { VectorService } from './vector.service.js'
import { VectorController } from './vector.controller.js'

@Global()
@Module({
  controllers: [VectorController],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}
