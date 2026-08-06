import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module.js'
import { StructuredLoggerService } from './common/logger/structured-logger.service.js'

async function bootstrap() {
  const logger = new StructuredLoggerService()
  const app = await NestFactory.create(AppModule, { logger })

  // Global Prefix
  app.setGlobalPrefix('api/v1', { exclude: ['health'] })

  // CORS setup
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
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
  const config = new DocumentBuilder()
    .setTitle('ACPIA API')
    .setDescription(
      'ACPIA — AI-powered Criminal & Paedophile Investigation Assistant Backend REST API'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 4000
  await app.listen(port)

  logger.log(`ACPIA API running on port ${port}`, {
    swaggerUrl: `http://localhost:${port}/api/docs`,
    healthUrl: `http://localhost:${port}/health`,
  })
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal API bootstrap error', err)
  process.exit(1)
})
