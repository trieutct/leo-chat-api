import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { AppDefault, ConfigKey } from './common/constants'
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter'
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor'

/** Khởi tạo user-service như 1 HTTP app bình thường (đóng vai producer gửi message qua RabbitMQ) */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const port =
    configService.get<number>(ConfigKey.USER_SERVICE_PORT) ??
    AppDefault.USER_SERVICE_PORT

  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(port)

  console.log(`user-service (HTTP) listening on http://localhost:${port}`)
}
void bootstrap()
