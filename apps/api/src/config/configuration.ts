import { registerAs } from '@nestjs/config'

export default registerAs('config', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiVersion: '1.0.0',
  serviceName: 'acpia.api',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
}))
