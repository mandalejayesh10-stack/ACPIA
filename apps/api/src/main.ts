import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module.js'
import { StructuredLoggerService } from './common/logger/structured-logger.service.js'
import { setupSwagger } from './swagger/swagger.setup.js'

async function bootstrap() {
  const logger = new StructuredLoggerService()
  const app = await NestFactory.create(AppModule, { logger })
  const configService = app.get(ConfigService)

  // Global Prefix
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'health/liveness', 'health/readiness'] })

  // CORS
  const corsOrigin = configService.get<string>('app.corsOrigin', '*')
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  })

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // Swagger Documentation Setup
  setupSwagger(app)

  const port = configService.get<number>('app.port', 4000)
  await app.listen(port)

  logger.log(`ACPIA NestJS API running on port ${port}`, {
    swaggerUrl: `http://localhost:${port}/api/docs`,
    healthUrl: `http://localhost:${port}/health`,
  })
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal API bootstrap error', err)
  process.exit(1)
})
