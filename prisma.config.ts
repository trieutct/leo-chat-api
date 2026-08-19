import { defineConfig, env } from 'prisma/config'

// prisma.config.ts chạy trước khi CLI tự load .env nên phải load thủ công ở đây
process.loadEnvFile()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // URL này chỉ dùng cho migrate/CLI (introspect, migrate dev/deploy)
  datasource: {
    url: env('DATABASE_URL'),
  },
})