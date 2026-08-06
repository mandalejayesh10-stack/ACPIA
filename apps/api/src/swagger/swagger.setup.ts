import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('ACPIA API')
    .setDescription(
      'ACPIA — AI-powered Criminal & Paedophile Investigation Assistant Backend REST API'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'Platform Health & Readiness Probes')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
}
