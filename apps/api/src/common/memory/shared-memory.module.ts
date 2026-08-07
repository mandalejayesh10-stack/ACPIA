import { Module, Global } from '@nestjs/common'
import { SharedMemoryService } from './shared-memory.service.js'

@Global()
@Module({
  providers: [SharedMemoryService],
  exports: [SharedMemoryService],
})
export class SharedMemoryModule {}
