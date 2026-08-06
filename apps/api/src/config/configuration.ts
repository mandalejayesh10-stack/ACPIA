import { registerAs } from '@nestjs/config'

export interface AppConfig {
  environment: string
  port: number
  apiVersion: string
  serviceName: string
  corsOrigin: string
}

export default registerAs('app', (): AppConfig => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiVersion: '1.0.0',
  serviceName: 'acpia.api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
}))
