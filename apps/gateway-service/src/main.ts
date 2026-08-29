import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { AppDefault, ConfigKey } from './common/constants'

/**
 * Khởi tạo gateway-service: điểm vào HTTP duy nhất cho client, forward request
 * xuống các service phía sau theo prefix path (vd: /api/users/* -> user-service).
 * KHÔNG dùng app.setGlobalPrefix('api') vì middleware proxy match theo path gốc
 * (chạy trước router resolver) -> prefix 'api' được khai báo trực tiếp trong path forRoutes.
 * bodyParser: false vì gateway chỉ forward raw request stream sang service phía sau,
 * để Nest tự parse body sẽ làm rỗng stream trước khi proxy đọc -> service đích nhận
 * Content-Length đúng nhưng body rỗng và bị treo chờ đủ byte.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })
  const configService = app.get(ConfigService)

  const port =
    configService.get<number>(ConfigKey.GATEWAY_SERVICE_PORT) ??
    AppDefault.GATEWAY_SERVICE_PORT

  await app.listen(port)

  console.log(`gateway-service listening on http://localhost:${port}`)
}
void bootstrap()
