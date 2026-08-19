import { registerAs } from '@nestjs/config'

/** Config chung của app, lấy từ biến môi trường */
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
}))
